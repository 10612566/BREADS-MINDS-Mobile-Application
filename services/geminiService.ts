
import { GoogleGenAI } from "@google/genai";
import { BeneficiaryReport, TargetGroup } from "../types";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImpact = async (reports: BeneficiaryReport[]) => {
  const dataSummary = reports.map(r => ({
    districtId: r.districtId,
    month: r.month,
    childrenReached: r.targetsReached[TargetGroup.CHILDREN],
    activities: r.activities,
    narrative: r.narrativeImpact
  }));

  const prompt = `
    As an expert in mental health monitoring and evaluation for BREADS (Bangalore Rural Education and Development Society), 
    analyze the following monthly report data for the MINDS project.
    
    Data: ${JSON.stringify(dataSummary)}
    
    Provide a concise analysis focusing on:
    1. Overall program momentum.
    2. Qualitative impact summary.
    3. Strategic suggestions for the BREADS Coordinator to improve outreach.
    
    Formatting: Use professional bullet points and bold key findings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Unable to generate insights at this moment.";
  }
};
