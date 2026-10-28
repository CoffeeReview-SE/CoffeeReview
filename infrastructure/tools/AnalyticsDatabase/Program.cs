using Microsoft.Extensions.Configuration;
using Npgsql;

// Inspect database metadata without printing credentials or visitor data.
var configuration = new ConfigurationBuilder()
    .AddUserSecrets("3e9d78aa-70f9-4b0b-ad63-abe6ee63fbc0")
    .AddEnvironmentVariables()
    .Build();
var connectionString = configuration.GetConnectionString("Supabase");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("Missing ConnectionStrings:Supabase in Analytics user secrets or environment.");
    return 1;
}
try
{
    await using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    if (args.Length == 1 && args[0] == "--validate-current-sql")
    {
        var directory = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../Database"));
        await SqlValidation.RunAsync(connection, directory);
        return 0;
    }
    if (args.Length == 1 && args[0] == "--apply-dashboard-migration")
    {
        var sqlPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,
            "../../../../../Database/analytics_dashboard_migration.sql"));
        await using var migration = new NpgsqlCommand(await File.ReadAllTextAsync(sqlPath), connection);
        migration.CommandTimeout = 90;
        await migration.ExecuteNonQueryAsync();
        Console.WriteLine("Dashboard migration applied successfully; inspecting resulting schema.");
    }
    else if (args.Length != 0)
    {
        Console.Error.WriteLine("Usage: AnalyticsDatabase [--apply-dashboard-migration | --validate-current-sql]");
        return 1;
    }
    await using var transaction = await connection.BeginTransactionAsync();
    await using (var readOnly = new NpgsqlCommand("SET TRANSACTION READ ONLY", connection, transaction))
        await readOnly.ExecuteNonQueryAsync();
    foreach (var query in new[]
    {
        """
        SELECT table_name, column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('visit_session','page_view','audio_play','brand','branch','language')
        ORDER BY table_name, ordinal_position
        """,
        """
        SELECT tablename, indexname, indexdef FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename IN ('visit_session','page_view','audio_play','brand','branch','language')
        ORDER BY tablename, indexname
        """,
        """
        SELECT c.relname, con.conname, pg_get_constraintdef(con.oid)
        FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname IN ('visit_session','page_view','audio_play','brand','branch','language')
        ORDER BY c.relname, con.conname
        """
    })
    {
        await using var command = new NpgsqlCommand(query, connection, transaction);
        await using var reader = await command.ExecuteReaderAsync();
        Console.WriteLine(string.Join(" | ", Enumerable.Range(0, reader.FieldCount).Select(reader.GetName)));
        while (await reader.ReadAsync())
            Console.WriteLine(string.Join(" | ", Enumerable.Range(0, reader.FieldCount)
                .Select(i => reader.IsDBNull(i) ? "NULL" : reader.GetValue(i).ToString())));
    }
    await transaction.CommitAsync();
    return 0;
}
catch (Exception error)
{
    Console.Error.WriteLine($"Schema inspection failed ({error.GetType().Name}); credentials and connection details omitted.");
    return 2;
}
