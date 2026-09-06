import { NextResponse } from "next/server";
import {supabase} from "@/lib/supabase";
import {GoogleGenAI} from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


export async function POST() {
    const { data: news , error: fetchError } = await supabase
    .from("news_items")
    .select("id, headline, summary")
    .is("embedding", null)

    if (fetchError) {
        return NextResponse.json({ error: "Failed to fetch news items" }, { status: 500 });
    }

    const results = [];

    for (const newsArticles of news) {
        const inputText = `${newsArticles.headline}. ${newsArticles.summary ?? ''}`;

        const response = await genAI.models.embedContent({
            model: "gemini-embedding-001",
            contents: inputText,
            config: { outputDimensionality: 1536},
        });
        
        const embedding = response.embeddings?.[0]?.values;
        if (!embedding) {
            throw new Error(`Failed to generate embedding for news item ${newsArticles.id}`);
        }

        const { error: updateError } = await supabase
        .from("news_items")
        .update({ embedding })
        .eq("id", newsArticles.id);
        
        results.push({ id: newsArticles.id, headline: newsArticles.headline, updateError });

    }
    return NextResponse.json({ success: true, count: results.length, results });
}

// here we are grabing any news items that do not have an embedding and generating 
// embeddings for them using the Google Gemini API.
// we are using the google gemini API to generate embeddings for the news items 
// and then updating the news_items table in the supabase database with the generated embeddings.
