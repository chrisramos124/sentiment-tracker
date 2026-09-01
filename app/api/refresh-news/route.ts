import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabase";

export async function POST() {
    const {data: watchlist, error: watchlistError} = await supabase
    .from("watchlist")
    .select("id, symbol");

    if (watchlistError) {
        return NextResponse.json({error: "Failed to fetch watchlist"}, {status: 500});
    }
    
    const results = []; 

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Get the date a week ago in YYYY-MM-DD format

    for (const stock of watchlist) {
        const res = await fetch(
            `https://finnhub.io/api/v1/company-news?symbol=${stock.symbol}&from=${weekAgo}&to=${today}&token=${process.env.FINNHUB_API_KEY}`
        );
        const news = await res.json();

        const topNews = Array.isArray(news) ? news.slice(0, 5) : [];

    for (const article of topNews) {
      const { error: insertError } = await supabase
        .from('news_items')
        .insert({
          watchlist_id: stock.id,
          headline: article.headline,
          summary: article.summary,
          source: article.source,
          published_at: new Date(article.datetime * 1000).toISOString(),
        });

      if (insertError) {
        results.push({ symbol: stock.symbol, headline: article.headline, insertError });
      }
    }

    results.push({ symbol: stock.symbol, articlesFound: topNews.length });
  }

  return NextResponse.json({ success: true, results });
}




