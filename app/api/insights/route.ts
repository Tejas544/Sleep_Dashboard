import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the SDK. Next.js automatically loads .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // Receive the summary and anomalies from the frontend
        const body = await req.json();
        const { summary, anomalies } = body;

        // Choose the fast, cost-effective model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        // Construct a highly specific prompt to prevent hallucination
        const prompt = `
        Act as an expert clinical sleep specialist analyzing a patient's polysomnography report.
        
        Patient Summary Data:
        - Overall Clinical Score: ${summary.overallScore}/100
        - Total Sleep: ${summary.totalSleepMinutes} minutes
        - Deep Sleep: ${summary.deepSleepMinutes} minutes
        - REM Sleep: ${summary.remSleepMinutes} minutes
        - Light Sleep: ${summary.lightSleepMinutes} minutes
        - Awake Time: ${summary.awakeMinutes} minutes
        
        Detected Anomalies:
        ${anomalies.length > 0 ? JSON.stringify(anomalies) : "No anomalies detected."}

        Based strictly on this data, provide a structured analysis. Do not invent data. 
        Format your response EXACTLY as a JSON object with these three keys:
        1. "assessment": A short, 2-sentence clinical assessment of their sleep architecture.
        2. "warnings": A short sentence addressing any anomalies (or praise if none).
        3. "recommendations": An array of 3 specific, actionable strings for the patient to improve their sleep.

        Return ONLY the raw JSON object. No markdown, no backticks, no introduction.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up any accidental markdown formatting from the LLM
        const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJsonStr);

        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("LLM Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
    }
}