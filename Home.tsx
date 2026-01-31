import { useState, useEffect } from 'react';

// =========================================================
// URLはそのままでOK
// =========================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxuyFL8a5BQVNufxLNtXy_iF0iLKcBZiwUlzuJ-kU2a_BVgOo2nFiUPoxwQBBlOqFGFOg/exec"; 


export default function Home() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("ja");
  
  const [database, setDatabase] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((rawData) => {
        if (!Array.isArray(rawData)) {
            setLoading(false);
            return;
        }

        const cleanData = rawData.slice(1).map((item: any) => {
          if (!item) return null;

          return {
            title_en: item["B列"],   
            title_ja: item["C列"],
            anime_ep: item["D列"],
            manga_ch: item["E列"],
            manga_vol: item["F列"],
            link_jp: item["G列"],
            link_us: item["H列"],
            // 🆕 ここでI列（画像）を読み込みます！
            image: item["I列"], 
          };
        }).filter((item) => item !== null); 

        setDatabase(cleanData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const t = {
    ja: {
      title: "アニメ→漫画 変換器",
      placeholder: "作品名で検索...",
      notFound: "見つかりませんでした...",
      animeEp: "アニメ最新話",
      mangaStart: "漫画はここから！",
      button: "Amazonで見る",
      loading: "データを読み込み中..."
    },
    en: {
      title: "Anime to Manga Converter",
      placeholder: "Search title...",
      notFound: "Not Found...",
      animeEp: "Anime Episode",
      mangaStart: "Start Reading",
      button: "View on Amazon",
      loading: "Loading data..."
    }
  };
  const currentText = lang === "ja" ? t.ja : t.en;

  const filteredData = database.filter((item: any) => {
    if (query === "") return false;
    const searchLower = query.toLowerCase();
    const titleEn = item.title_en ? String(item.title_en).toLowerCase() : "";
    const titleJa = item.title_ja ? String(item.title_ja) : "";
    return titleEn.includes(searchLower) || titleJa.includes(searchLower);
  });

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", color: "#333", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      
      {/* ヘッダーボタン */}
      <div style={{display: "flex", justifyContent: "flex-end", marginBottom: "20px"}}>
        <button 
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          style={{ padding: "8px 16px", borderRadius: "20px", border: "none", background: "#222", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
        >
          {lang === "ja" ? "English" : "日本語"}
        </button>
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "24px" }}>{currentText.title} 📺</h1>

      {loading && <p style={{textAlign: "center", fontWeight: "bold", color: "#666"}}>{currentText.loading}</p>}

      {/* 検索ボックス */}
      <input
        type="text"
        placeholder={currentText.placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        style={{ width: "100%", padding: "15px", fontSize: "16px", borderRadius: "12px", border: "1px solid #ddd", marginBottom: "30px", boxSizing: "border-box", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
      />

      {/* 結果リスト */}
      <div>
        {query === "" ? (
          <p style={{ textAlign: "center", color: "#aaa", marginTop: "50px" }}>🔍 {currentText.placeholder}</p>
        ) : filteredData.length > 0 ? (
          filteredData.map((item: any, index) => (
            <div key={index} style={{ 
              display: "flex", 
              background: "white", 
              borderRadius: "12px", 
              overflow: "hidden", 
              marginBottom: "20px", 
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)" 
            }}>
              
              {/* 🖼 左側：画像エリア（画像がないときはグレー） */}
              <div style={{ width: "100px", minWidth: "100px", background: "#eee" }}>
                {item.image ? (
                  <img src={item.image} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>📖</div>
                )}
              </div>

              {/* 📝 右側：情報エリア */}
              <div style={{ flex: 1, padding: "15px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h2 style={{ margin: "0 0 10px 0", fontSize: "18px", lineHeight: "1.4" }}>
                  {lang === "ja" ? item.title_ja : item.title_en}
                </h2>
                
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ background: "#f0f0f0", padding: "5px 10px", borderRadius: "6px" }}>
                    <p style={{ margin: 0, fontSize: "10px", color: "#666" }}>ANIME</p>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>Ep {item.anime_ep}</p>
                  </div>
                  <div style={{ fontSize: "20px", alignSelf: "center" }}>→</div>
                  <div style={{ background: "#fff0f0", padding: "5px 10px", borderRadius: "6px", border: "1px solid #ffd0d0" }}>
                    <p style={{ margin: 0, fontSize: "10px", color: "#e63946" }}>MANGA</p>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px", color: "#e63946" }}>
                      Vol.{item.manga_vol}
                    </p>
                  </div>
                </div>

                {(lang === "ja" ? item.link_jp : item.link_us) && (
                  <a 
                    href={lang === "ja" ? item.link_jp : item.link_us} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: "block", 
                      padding: "10px", 
                      background: "#FF9900", 
                      color: "white", 
                      textAlign: "center", 
                      textDecoration: "none", 
                      borderRadius: "6px", 
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    {currentText.button}
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "red" }}>{currentText.notFound}</p>
        )}
      </div>
    </div>
  );
}
