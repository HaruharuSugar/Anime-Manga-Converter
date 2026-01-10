import { useState, useEffect } from 'react';

// =========================================================
// URLはそのままでOK！（もし消えてたら貼り直してね）
// =========================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxuyFL8a5BQVNufxLNtXy_iF0iLKcBZiwUlzuJ-kU2a_BVgOo2nFiUPoxwQBBlOqFGFOg/exec"; 


export default function App() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("ja");
  
  // 【修正1】ここがエラーの原因でした！
  // 「中身はなんでもOKな配列だよ」と明示して、Vercelを安心させます。
  const [database, setDatabase] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((rawData) => {
        // 【修正2】データが本当に配列かチェックする安全策を追加
        if (!Array.isArray(rawData)) {
            console.error("データが配列ではありません");
            setLoading(false);
            return;
        }

        const cleanData = rawData.slice(1).map((item: any) => {
          // 【修正3】万が一、中身が空っぽ(null)の行があっても無視するようにする
          if (!item) return null;

          return {
            title_en: item["B列"],   
            title_ja: item["C列"],
            anime_ep: item["D列"],
            manga_ch: item["E列"],
            manga_vol: item["F列"],
            link_jp: item["G列"],
            link_us: item["H列"],
          };
        }).filter((item) => item !== null); // 空っぽの行を捨てる

        setDatabase(cleanData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("データの取得に失敗しました", err);
        setLoading(false);
      });
  }, []);

  const t = {
    ja: {
      title: "アニメ→漫画 変換器",
      placeholder: "アニメのタイトルを入力...",
      notFound: "見つかりませんでした...",
      animeEp: "アニメ最新話",
      mangaStart: "漫画はここから！",
      button: "Amazonで見る",
      guide: "検索してね！",
      loading: "データを読み込み中..."
    },
    en: {
      title: "Anime to Manga Converter",
      placeholder: "Enter Anime Title...",
      notFound: "Not Found...",
      animeEp: "Anime Episode",
      mangaStart: "Start Reading",
      button: "View on Amazon",
      guide: "Search for an anime!",
      loading: "Loading data..."
    }
  };
  const currentText = lang === "ja" ? t.ja : t.en;

  const filteredData = database.filter((item: any) => {
    if (query === "") return false;
    const searchLower = query.toLowerCase();
    
    // データがない場合の安全策
    const titleEn = item.title_en ? String(item.title_en).toLowerCase() : "";
    const titleJa = item.title_ja ? String(item.title_ja) : "";
    
    return titleEn.includes(searchLower) || titleJa.includes(searchLower);
  });

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", color: "#333", backgroundColor: "#fff", minHeight: "100vh" }}>
      
      <div style={{display: "flex", justifyContent: "flex-end", marginBottom: "10px"}}>
        <button 
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          style={{ padding: "8px 16px", borderRadius: "20px", border: "none", background: "#333", color: "white", cursor: "pointer", fontWeight: "bold" }}
        >
          {lang === "ja" ? "🌏 Switch to English" : "🌏 日本語にする"}
        </button>
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>{currentText.title} 📺</h1>

      {loading && <p style={{textAlign: "center", fontWeight: "bold"}}>{currentText.loading}</p>}

      <input
        type="text"
        placeholder={currentText.placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        style={{ width: "100%", padding: "15px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "30px", boxSizing: "border-box" }}
      />

      <div>
        {query === "" ? (
          <p style={{ textAlign: "center", color: "#888" }}>{currentText.guide}</p>
        ) : filteredData.length > 0 ? (
          filteredData.map((item: any, index) => (
            <div key={index} style={{ border: "1px solid #eee", padding: "20px", borderRadius: "10px", marginBottom: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", background: "white" }}>
              <h2 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>
                {lang === "ja" ? item.title_ja : item.title_en}
              </h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", background: "#f0f0f0", padding: "15px", borderRadius: "5px", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{currentText.animeEp}</p>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "18px" }}>Ep {item.anime_ep}</p>
                </div>
                <div style={{ fontSize: "24px" }}>➡️</div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#e63946" }}>{currentText.mangaStart}</p>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "18px", color: "#e63946" }}>
                    Ch. {item.manga_ch} (Vol.{item.manga_vol})
                  </p>
                </div>
              </div>

              {(lang === "ja" ? item.link_jp : item.link_us) && (
                <a 
                  href={lang === "ja" ? item.link_jp : item.link_us} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: "block", marginTop: "15px", padding: "12px", background: "#FF9900", color: "white", textAlign: "center", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}
                >
                  {currentText.button} (Vol.{item.manga_vol})
                </a>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "red" }}>{currentText.notFound}</p>
        )}
      </div>
    </div>
  );
}