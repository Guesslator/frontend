import { LANGUAGES, languageNames, languageGreetings } from "@/lib/i18n";
import LanguageClient from "@/components/LanguageClient";

export default function LanguageSelectionPage() {
  const languages = LANGUAGES.map((code) => ({
    code,
    name: languageNames[code] || code,
    greeting: languageGreetings[code] || "Welcome",
  }));

  return <LanguageClient languages={languages} />;
}
