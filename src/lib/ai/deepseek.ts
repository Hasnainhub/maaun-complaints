/**
 * DeepSeek AI classification service for MAAUN complaints
 */

import { AIProvider, ComplaintPriority } from "@/types";

interface AIClassificationResult {
    category: string;
    priority: ComplaintPriority;
    department: string;
    confidence: number;
}

interface AIResponse {
    provider: AIProvider;
    data: AIClassificationResult;
}

const DEPARTMENTS = ["ICT", "Hostel", "Finance", "Security", "Academics", "Admin"];

/**
 * Builds the prompt for the DeepSeek API
 */
function buildPrompt(title: string, description: string): string {
    return `
You are an intelligent classification system for the Maryam Abacha American University (MAAUN) complaint tracking portal.
Your task is to analyze the following complaint and categorize it.

Complaint Title: ${title}
Complaint Description: ${description}

Classify the complaint into exactly one of these departments: ${DEPARTMENTS.join(", ")}.
Determine the priority: "low", "medium", or "high".
Provide a short 1-3 word category name (e.g., "Network Outage", "Plumbing", "Tuition Fee").
Provide a confidence score between 0.0 and 1.0.

Respond ONLY with a valid JSON object matching this schema, nothing else:
{
  "category": "string",
  "priority": "low" | "medium" | "high",
  "department": "string",
  "confidence": number
}
`;
}

/**
 * Parses and validates the JSON response from DeepSeek
 */
function parseAndValidateJson(jsonString: string): AIClassificationResult | null {
    try {
        // Sometimes LLMs wrap JSON in markdown blocks
        const cleanJson = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        if (
            typeof parsed.category === "string" &&
            ["low", "medium", "high"].includes(parsed.priority) &&
            DEPARTMENTS.includes(parsed.department) &&
            typeof parsed.confidence === "number"
        ) {
            return parsed as AIClassificationResult;
        }
        console.error("DeepSeek returned invalid JSON schema:", parsed);
        return null;
    } catch (error) {
        console.error("Failed to parse DeepSeek JSON:", jsonString);
        return null;
    }
}

/**
 * Fallback classifier based on simple keywords if DeepSeek fails
 */
function fallbackClassifier(title: string, description: string): AIClassificationResult {
    const text = (title + " " + description).toLowerCase();

    let department = "Admin";
    let priority: ComplaintPriority = "medium";
    let category = "General";

    // Naive keyword matching
    if (text.match(/network|wifi|internet|portal|login|password/)) {
        department = "ICT";
        category = "IT Support";
    } else if (text.match(/water|room|bed|toilet|clean|hostel|mattress/)) {
        department = "Hostel";
        category = "Facilities";
    } else if (text.match(/fee|payment|receipt|refund|invoice|clearance/)) {
        department = "Finance";
        category = "Billing";
    } else if (text.match(/theft|attack|fight|harass|steal|security|unsafe/)) {
        department = "Security";
        priority = "high";
        category = "Safety/Security";
    } else if (text.match(/result|lecturer|exam|grade|assignment|course|schedule/)) {
        department = "Academics";
        category = "Academics";
    }

    // Determine priority roughly by keywords
    if (text.match(/urgent|immediately|emergency|danger|crisis/)) {
        priority = "high";
    }

    return {
        category,
        priority,
        department,
        confidence: 0.5, // 50% confidence for fallback
    };
}

/**
 * Main function to classify a complaint
 */
export async function classifyComplaint(title: string, description: string): Promise<AIResponse> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey || apiKey === "<DEEPSEEK_API_KEY>") {
        console.log("DeepSeek API key missing or invalid. Using fallback classifier.");
        return {
            provider: "fallback",
            data: fallbackClassifier(title, description)
        };
    }

    try {
        const prompt = buildPrompt(title, description);

        console.log("Calling DeepSeek API...");
        // Using OpenAI compatible endpoint for DeepSeek chat
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a helpful assistant that strictly returns valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1, // Low temperature for more deterministic output
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        const content = json.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("Empty response from DeepSeek API");
        }

        const validatedResult = parseAndValidateJson(content);

        if (validatedResult) {
            return {
                provider: "deepseek",
                data: validatedResult
            };
        } else {
            throw new Error("Validation failed for DeepSeek response");
        }

    } catch (error) {
        console.warn("DeepSeek classification failed, using fallback:", error);
        return {
            provider: "fallback",
            data: fallbackClassifier(title, description)
        };
    }
}
