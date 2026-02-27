"use client";

import { t, Language, LANGUAGES, languageNames } from "@/lib/i18n";

interface Step1ConfigProps {
  lang: Language;
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step1Config({
  lang,
  formData,
  setFormData,
}: Step1ConfigProps) {
  const toggleLanguage = (l: Language) => {
    const current = formData.languages || [];
    if (current.includes(l)) {
      if (current.length > 1) {
        setFormData({
          ...formData,
          languages: current.filter((x: string) => x !== l),
        });
      }
    } else {
      setFormData({ ...formData, languages: [...current, l] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Type Selection */}
      <div className="bg-background/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground tracking-tight">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
          </div>
          {t(lang, "type")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1">
              {t(lang, "type")}
            </label>
            <div className="relative group/select">
              <select
                className="w-full appearance-none bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-5 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none hover:bg-white/5 transition-all duration-300 cursor-pointer font-medium"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value,
                    subcategory: "",
                  })
                }
              >
                <option value="MOVIE" className="bg-[#0f0f13] text-white py-2">
                  {t(lang, "movie")}
                </option>
                <option value="SERIES" className="bg-[#0f0f13] text-white py-2">
                  {t(lang, "tvSeries")}
                </option>
                <option value="GAME" className="bg-[#0f0f13] text-white py-2">
                  {t(lang, "game")}
                </option>
                <option value="SPORTS" className="bg-[#0f0f13] text-white py-2">
                  {t(lang, "sport")}
                </option>
                <option value="MUSIC" className="bg-[#0f0f13] text-white py-2">
                  {t(lang, "music")}
                </option>
                <option value="MIXED" className="bg-[#0f0f13] text-white py-2">
                  {t(lang, "mixed")}
                </option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover/select:text-primary transition-colors">
                ▼
              </div>
            </div>
          </div>

          {formData.type === "SPORTS" && (
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1">
                {t(lang, "subcategory")}
              </label>
              <div className="relative group/select">
                <select
                  className="w-full appearance-none bg-background/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-5 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none hover:bg-white/5 transition-all duration-300 cursor-pointer font-medium"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                >
                  <option value="" className="bg-[#0f0f13] text-white py-2">
                    {t(lang, "selectSubcategory")}
                  </option>
                  <option
                    value="FOOTBALL"
                    className="bg-[#0f0f13] text-white py-2"
                  >
                    {t(lang, "football")}
                  </option>
                  <option
                    value="BASKETBALL"
                    className="bg-[#0f0f13] text-white py-2"
                  >
                    {t(lang, "basketball")}
                  </option>
                  <option value="MMA" className="bg-[#0f0f13] text-white py-2">
                    {t(lang, "mma")}
                  </option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover/select:text-primary transition-colors">
                  ▼
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-background/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground tracking-tight">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
          </div>
          {t(lang, "selectLanguages")}
        </h3>
        {/* Scrollable container for Languages - max 5 visual rows approx ~300px */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {[...LANGUAGES]
            .sort((a, b) => {
              const aSelected = formData.languages.includes(a);
              const bSelected = formData.languages.includes(b);
              if (aSelected && !bSelected) return -1;
              if (!aSelected && bSelected) return 1;
              return 0; // maintain original order otherwise
            })
            .map((l) => (
              <div
                key={l}
                onClick={() => toggleLanguage(l)}
                className={`group/lang relative p-4 rounded-xl border transition-all duration-300 flex items-center justify-between overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 ${
                  formData.languages.includes(l)
                    ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]"
                    : "border-white/5 hover:border-white/20 bg-background/50 backdrop-blur-md"
                }`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span className="text-xs font-black px-2 py-1 rounded-md bg-white/5 border border-white/10 text-muted-foreground uppercase transition-colors group-hover/lang:text-foreground">
                    {l}
                  </span>
                  <span className="font-semibold text-sm text-muted-foreground group-hover/lang:text-foreground transition-colors">
                    {languageNames[l]}
                  </span>
                </div>
                {formData.languages.includes(l) && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
