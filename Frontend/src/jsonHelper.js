// jsonHelper.js
import jsonlint from "jsonlint-mod";

export function tryParseAndFixJSON(jsonText) {
  try {
    return { parsed: JSON.parse(jsonText), error: null };
  } catch (err) {
    try {
      const fixed = jsonlint.parse(jsonText);
      return { parsed: fixed, error: null };
    } catch (jsonLintErr) {
      const roughFixed = jsonText
        .replace(/\\n/g, "\\n")
        .replace(/([^\])"([^":,{}\[\]]*?)":/g, (_, key) => `"${key}":`)
        .replace(/([,:{[]\s*)"(.*?)(?<!\\)"/g, (_, before, val) => `${before}"${val.replace(/"/g, '\\"')}"`);

      try {
        return { parsed: JSON.parse(roughFixed), error: null };
      } catch (finalFail) {
        return { parsed: null, error: finalFail.message };
      }
    }
  }
}
