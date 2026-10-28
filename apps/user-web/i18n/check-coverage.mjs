// Lệnh check node apps/user-web/i18n/check-coverage.mjs
import { createServer } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const i18nDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(i18nDirectory, "../../..");
const vite = await createServer({
  configFile: resolve(projectRoot, "vite.config.js"),
  root: projectRoot,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  // Tải báo cáo độ phủ dịch thuật
  const { getI18nCoverageReport } = await vite.ssrLoadModule(
    "/apps/user-web/i18n/translationCoverage.js",
  );
  const report = getI18nCoverageReport();
  let hasMissingTranslations = false;

  // hiển thị kết quả kiểm tra
  const show = (label, details) => {
    const missing = details.filter((item) => !item.complete);
    if (missing.length) hasMissingTranslations = true;
    console.log(`${missing.length ? "[THIẾU]" : "[ĐỦ]  "} ${label}`);
    for (const item of missing) {
      const missingValues = item.missing.join(", ");
      console.log(`  - ${item.name}: ${missingValues}`);
    }
  };

  show(
    "Từ điển giao diện",
    Object.entries(report.interface).map(([language, result]) => ({
      name: language,
      complete: result.complete,
      missing: result.missingKeys,
    })),
  );

  show(
    "Trang thương hiệu",
    Object.entries(report.brandDetails).map(([language, result]) => ({
      name: language,
      complete: result.complete,
      missing: [
        ...result.missingLabels.map((key) => `labels.${key}`),
        ...result.missingScreenLabels.map((key) => `screenLabels.${key}`),
      ],
    })),
  );

  show(
    "Bản dịch thương hiệu offline",
    Object.entries(report.offlineBrands).map(([brand, result]) => ({
      name: brand,
      complete: result.complete,
      missing: result.missingLanguages,
    })),
  );

  show(
    "Thuật ngữ địa chỉ offline",
    Object.entries(report.offlineAddresses).map(([language, result]) => ({
      name: language,
      complete: result.complete,
      missing: result.missingTerms,
    })),
  );

  if (hasMissingTranslations) {
    console.error("\nCòn nội dung dịch thiếu. Hãy bổ sung trong LanguageProvider.jsx hoặc i18n.");
    process.exitCode = 1;
  } else {
    console.log("\nĐộ phủ bản dịch đầy đủ.");
  }
}

finally {
  await vite.close();
}
