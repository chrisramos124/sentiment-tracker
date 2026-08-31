import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabase";

export async function POST() {
    const {data: watchlist, error: watchlistError} = await supabase
    .from("watchlist")
    .select("*");

    if (watchlistError) {
        return NextResponse.json({error: "Failed to fetch watchlist"}, {status: 500});
    }

    const results = [];

    for(const stock of watchlist) {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${process.env.FINNHUB_API_KEY}`);
        const quote = await res.json();

        const {error: insertError} = await supabase
        .from('price_snapshots')
        .insert({
            watchlist_id: stock.id,
            price: quote.c,
            change_24h: quote.dp,
        });
        results.push({symbol: stock.symbol, price: quote.c , insertError});
    }
    return NextResponse.json({ success: true, results });
}

/*
    this function will be called when the user clicks the "Refresh Prices" button on the watchlist page.
    it will fetch the latest prices for all the stocks in the watchlist from the 
    finnhub API and insert them into the price_snapshots table in the supabase database.
*/