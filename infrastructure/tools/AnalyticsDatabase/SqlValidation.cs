using Npgsql;
using System.Text.RegularExpressions;

static class SqlValidation
{
    // Validate the consolidated schema inside an isolated rolled-back schema.
    public static async Task RunAsync(NpgsqlConnection connection, string directory)
    {
        var schema = "sgcoffee_check_" + Guid.NewGuid().ToString("N");
        await using var transaction = await connection.BeginTransactionAsync();
        async Task Execute(string sql)
        {
            await using var command = new NpgsqlCommand(sql, connection, transaction) { CommandTimeout = 60 };
            await command.ExecuteNonQueryAsync();
        }
        async Task<long> Count(string sql)
        {
            await using var command = new NpgsqlCommand(sql, connection, transaction);
            return (long)(await command.ExecuteScalarAsync())!;
        }
        async Task RunFile(string name)
        {
            var sql = await File.ReadAllTextAsync(Path.Combine(directory, name));
            sql = Regex.Replace(sql, @"^(BEGIN|COMMIT);\s*$", "", RegexOptions.Multiline);
            sql = sql.Replace("public.", $"\"{schema}\".").Replace("'public'", $"'{schema}'");
            await Execute(sql);
        }
        void Check(bool condition, string message)
        {
            if (!condition) throw new InvalidOperationException(message);
            Console.WriteLine("PASS " + message);
        }
        try
        {
            await Execute($"CREATE SCHEMA \"{schema}\"; SET LOCAL search_path TO \"{schema}\"; SET LOCAL statement_timeout = '60s';");
            await RunFile("SGCoffeeData.sql");
            Check(await Count($"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '{schema}' AND table_type = 'BASE TABLE'") == 7, "fresh schema contains seven application tables");
            Check(await Count("SELECT COUNT(*) FROM brand") == 10, "ten brands seeded");
            Check(await Count("SELECT COUNT(*) FROM branch") == 30, "thirty branches seeded");
            Check(await Count("SELECT COUNT(DISTINCT brand_id) FROM branch") == 10, "branches cover all ten brands");
            await RunFile("SGCoffeeData.sql");
            Check(await Count("SELECT COUNT(*) FROM branch") == 30, "repeated schema and branch imports do not duplicate branches");
            Check(await Count("SELECT COUNT(*) FROM visit_session") == 0 && await Count("SELECT COUNT(*) FROM audio_play") == 0,
                "no fake analytics events are seeded");
            Check(await Count($"SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='{schema}' AND c.relkind='r' AND c.relrowsecurity") == 7,
                "row level security is enabled on all seven tables");
            Check(await Count("SELECT COUNT(*) FROM brand WHERE description_language_code='vi'") == 10,
                "all brand descriptions use Vietnamese");
            Check(await Count("SELECT COUNT(*) FROM brand WHERE type IS NOT NULL AND type NOT LIKE '%?%'") == 10,
                "all ten brands have valid category labels");
            Check(await Count("SELECT COUNT(*) FROM branch WHERE latitude IS NOT NULL OR longitude IS NOT NULL OR opening_hours IS NOT NULL") == 0,
                "unverified coordinates and opening hours stay empty");
        }
        finally { await transaction.RollbackAsync(); }
        Console.WriteLine("Validation complete; temporary schema and all test rows rolled back.");
    }
}
