using Microsoft.Extensions.FileProviders;

var directory = Path.Combine(Path.GetTempPath(), "coffee-translations-" + Guid.NewGuid().ToString("N"));
var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Translations:Directory"] = directory }).Build();
var environment = new TestEnvironment();
var store = new BrandTranslationStore(config, environment);
void Check(bool value, string message) { if (!value) throw new Exception(message); }
try
{
    Check(await store.Read(11, "en", default) is null, "Missing translation");
    var first = await store.Save(11, "en", new(" Original translation ", "Vietnamese source", null), default);
    Check(first?.Description == "Original translation", "Trim saved text");
    var reloaded = await new BrandTranslationStore(config, environment).Read(11, "en", default);
    Check(reloaded == first, "Survives store restart");
    Check(reloaded!.SourceHash == BrandTranslationStore.Hash("Vietnamese source"), "Tracks source");
    Check(reloaded.SourceHash != BrandTranslationStore.Hash("Changed source"), "Detects stale source");
    Check(await store.Save(11, "en", new("Wrong", "Vietnamese source", null), default) is null, "Rejects stale save");
    var writes = await Task.WhenAll(Enumerable.Range(0, 8).Select(i => store.Save(11, "en", new("Update " + i, "Vietnamese source", first!.Revision), default)));
    Check(writes.Count(result => result is not null) == 1, "Exactly one concurrent update wins");
    Check(await store.Read(11, "ja", default) is null, "Language isolation");
    Check(await store.Read(12, "en", default) is null, "Brand isolation");
    var imageConfig = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Images:UploadDirectory"] = directory }).Build();
    var imageStore = new BrandTranslationStore(imageConfig, environment);
    await imageStore.Save(25, "zh", new("Chinese translation", "Source", null), default);
    Check(File.Exists(Path.Combine(directory, ".metadata", "translations", "brands", "25", "zh.json")), "Reuses persistent image volume");
    try { await store.Read(11, "../../outside", default); throw new Exception("Unsafe path accepted"); }
    catch (ArgumentException) { }
    Console.WriteLine("PASS: persistence, source freshness, concurrent updates, isolation and path validation");
}
finally { if (Directory.Exists(directory)) Directory.Delete(directory, true); }

sealed class TestEnvironment : IHostEnvironment
{
    public string EnvironmentName { get; set; } = "Test";
    public string ApplicationName { get; set; } = "TranslationTests";
    public string ContentRootPath { get; set; } = Path.GetTempPath();
    public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
}
