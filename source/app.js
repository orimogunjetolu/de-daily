
/* =====================================================================
   CURRICULUM DATA
   Add a module: push an object into CURRICULUM.modules (see bottom).
   Markup inside definitions / code:
     [[word]]        -> keyword blank (Levels 1-2). Alternatives: [[a|b]]
     {{long phrase}} -> long-phrase blank for Level 3 (optional; if absent,
                        definitions blank the span around the keywords and
                        code blanks the line(s) holding the keywords).
   Problem kinds: 'sql' (auto-checked against the solution using the
   in-browser SQLite engine) or 'open' (write answer, compare with the
   worked solution, self-grade).
   ===================================================================== */

/* Sample dataset inspired by the Deezer "Top Nigeria" chart. Song titles,
   artists and durations are real; chart dates, positions and stream counts
   are illustrative. Loaded fresh into SQLite for every query. */
const DATASET_SQL = `
CREATE TABLE artists (
  artist_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  genre     TEXT
);
INSERT INTO artists VALUES
 (1,'Ayra Starr','Afrobeats'),(2,'Victony','Afrobeats'),(3,'FOLA','Afrobeats'),
 (4,'Kizz Daniel','Afrobeats'),(5,'Omah Lay','Afrobeats'),(6,'Blaqbonez','Hip-hop'),
 (7,'Brymo','Alternative'),(8,'Asake','Afrobeats'),(9,'Young Jonn','Afrobeats'),
 (10,'BNXN','Afrobeats'),(11,'LAZER DIM 700','Hip-hop'),(12,'Burna Boy','Afro-fusion'),
 (13,'Tems',NULL),(14,'Rema','Afrobeats');

CREATE TABLE songs (
  song_id      INTEGER PRIMARY KEY,
  title        TEXT NOT NULL,
  artist_id    INTEGER REFERENCES artists(artist_id),
  duration_sec INTEGER
);
INSERT INTO songs VALUES
 (1,'Heaven Baby',1,159),(2,'SLICK',2,106),(3,'waf',3,161),(4,'Owo Oluwa',4,177),
 (5,'DON''T LOVE ME',5,181),(6,'IKEBE 3000',6,197),(7,'Love Na Drug',7,237),
 (8,'Forgiveness',8,158),(9,'Elumelu',9,133),(10,'Online',10,172),
 (11,'Goodbye (Warm Up)',1,163),(12,'Freddy Kooger',11,103),(13,'Money Good',7,152),
 (14,'Calm Down',14,239);

CREATE TABLE chart_entries (
  chart_date TEXT,
  position   INTEGER,
  song_id    INTEGER REFERENCES songs(song_id),
  streams    INTEGER,
  PRIMARY KEY (chart_date, song_id)
);
INSERT INTO chart_entries VALUES
 ('2026-10-15',1,2,98000),('2026-10-15',2,1,95000),('2026-10-15',3,4,81000),
 ('2026-10-15',4,3,77000),('2026-10-15',5,12,70000),('2026-10-15',6,5,64000),
 ('2026-10-15',7,10,60000),('2026-10-15',8,8,55000),('2026-10-15',9,6,51000),
 ('2026-10-15',10,13,47000),
 ('2026-10-16',1,1,101000),('2026-10-16',2,2,96000),('2026-10-16',3,3,83000),
 ('2026-10-16',4,4,80000),('2026-10-16',5,5,66000),('2026-10-16',6,11,63000),
 ('2026-10-16',7,6,58000),('2026-10-16',8,12,NULL),('2026-10-16',9,8,52000),
 ('2026-10-16',10,7,49000),
 ('2026-10-17',1,1,108000),('2026-10-17',2,2,94000),('2026-10-17',3,3,88000),
 ('2026-10-17',4,11,79000),('2026-10-17',5,4,76000),('2026-10-17',6,5,65000),
 ('2026-10-17',7,6,61000),('2026-10-17',8,7,57000),('2026-10-17',9,8,50000),
 ('2026-10-17',10,9,48000);
`;

const DATASET_SCHEMA = [
  ['artists', 'artist_id (PK), name, genre: 14 rows (Tems has a NULL genre)'],
  ['songs', 'song_id (PK), title, artist_id (FK → artists), duration_sec: 14 rows'],
  ['chart_entries', 'chart_date, position, song_id (FK → songs), streams: 30 rows (top 10 for 2026-10-15/16/17; one NULL stream count)']
];

const SQL_LESSONS_A = [
{ id:'sql1', title:'Tables, keys & SELECT',
  theory:{
    why:'Before databases, data lived in files and spreadsheets. They break when many people edit at once, when rows reach the millions, or when the same fact (an artist\'s name) is copied into hundreds of places and someone updates only one copy. In 1970 Edgar Codd proposed the <b>relational model</b>: store each kind of fact in its own <b>table</b>, give every row a <b>key</b>, and link tables through keys. You then describe <i>what</i> result you want and the database works out <i>how</i> to get it.',
    body:[
      'A <b>table</b> is a set of <b>rows</b> (records) that share the same <b>columns</b> (attributes). Each column has a <b>data type</b> (INTEGER, TEXT, DATE…). The full list of tables, columns, types and rules is the <b>schema</b>.',
      'A <b>primary key</b> (PK) uniquely identifies each row and can never be NULL. In our dataset <code>songs.song_id</code> is the PK. A <b>foreign key</b> (FK) such as <code>songs.artist_id</code> points to the PK of another table, so an artist\'s name is stored once and referenced everywhere.',
      'SQL is <b>declarative</b>. <code>SELECT title FROM songs</code> says what you want; the <b>query planner</b> decides whether to scan the table or use an index. This is why the same SQL runs on Postgres, BigQuery, Snowflake or DuckDB, the engine in your Deezer chart pipeline.',
      '<code>SELECT</code> chooses columns (and can compute expressions), <code>FROM</code> names the table, and <code>AS</code> gives a result column an <b>alias</b>.'
    ],
    pro:'"The songs table has song_id as its primary key and artist_id as a foreign key to artists, so artist attributes are stored once and joined in at query time."',
    q:{ q:'Why not just store the artist name directly in every chart row?', a:'Because the same fact would be repeated many times. If an artist changes their name you must update every copy, and missing one causes inconsistent data (an update anomaly). Storing it once and referencing it with a key avoids that.' }
  },
  terms:[
    { id:'sql1-t1', term:'Table', def:'A named collection of [[rows]] and [[columns]] where each row is one record of the {{same kind of thing}}.' },
    { id:'sql1-t2', term:'Primary key', def:'A column or set of columns whose value [[uniquely]] identifies each row; it can never be [[NULL]].' },
    { id:'sql1-t3', term:'Foreign key', def:'A column that [[references]] the primary key of [[another table]], linking related rows.' },
    { id:'sql1-t4', term:'Declarative language', def:'A language where you describe {{[[what]] result you want, not [[how]] to compute it}}; the database\'s [[query planner]] chooses the steps.' },
    { id:'sql1-t5', term:'Schema', def:'The [[structure]] of a database: its tables, columns, [[data types]] and constraints.' }
  ],
  code:[
    { id:'sql1-c1', task:'Show every song\'s title and its duration in seconds.', lang:'sql', code:'SELECT [[title]], duration_sec\n[[FROM]] songs;' },
    { id:'sql1-c2', task:'Show each title with its duration converted to minutes, named duration_min.', lang:'sql', code:'SELECT title,\n       duration_sec / 60.0 [[AS]] duration_min\nFROM [[songs]];' },
    { id:'sql1-c3', task:'Return every column of the artists table.', lang:'sql', code:'SELECT [[*]]\n[[FROM]] artists;' }
  ],
  problems:[
    { id:'sql1-p1', kind:'sql', title:'Artist directory',
      scenario:'The product team is building an artist page. They need every artist\'s name and genre, nothing else. Write the query.',
      hint:'Two columns, one table. No filtering needed.',
      solution:'SELECT name, genre\nFROM artists;',
      explain:'List only the columns you need instead of <code>SELECT *</code>. In columnar warehouses like BigQuery you pay per column scanned, so selecting fewer columns is cheaper. It also keeps the query stable if someone adds columns later.' }
  ]
},

{ id:'sql2', title:'Filtering with WHERE (and NULL)',
  theory:{
    why:'You almost never want every row. A warehouse table might hold billions of rows, and BigQuery or Snowflake charge for the data you scan. Filtering lets you ask for exactly the rows that answer the question. To filter correctly you need to understand how SQL handles <b>missing</b> data.',
    body:[
      '<code>WHERE</code> holds a <b>predicate</b>, a condition checked on every row. Only rows where it is <b>TRUE</b> are kept. Combine predicates with <code>AND</code>, <code>OR</code> and <code>NOT</code>, and use parentheses to make the order clear.',
      '<b>NULL</b> means "unknown or missing". It is not 0 and it is not an empty string. SQL uses <b>three-valued logic</b>: <code>streams = NULL</code> is <b>UNKNOWN</b>, not TRUE, so it never matches. Always test with <code>IS NULL</code> or <code>IS NOT NULL</code>.',
      'Handy operators: <code>IN (\'a\',\'b\')</code> is shorthand for several ORs, <code>BETWEEN 100 AND 200</code> includes both ends, and <code>LIKE \'Love%\'</code> matches patterns, where <code>%</code> stands for any run of characters and <code>_</code> for exactly one.',
      'Text values go in <b>single quotes</b>: <code>\'2026-10-17\'</code>. Double quotes are for identifiers (column or table names) in standard SQL.'
    ],
    pro:'"I filtered with WHERE streams IS NULL, because an equality comparison against NULL evaluates to UNKNOWN and would silently return zero rows."',
    q:{ q:'A teammate writes WHERE genre <> \'Afrobeats\' to get "all non-Afrobeats artists". Which artist goes missing, and why?', a:'Tems. Her genre is NULL, and NULL <> \'Afrobeats\' is UNKNOWN, not TRUE, so WHERE drops the row. Write WHERE genre <> \'Afrobeats\' OR genre IS NULL to keep her.' }
  },
  terms:[
    { id:'sql2-t1', term:'Predicate', def:'A condition that evaluates to [[TRUE]], [[FALSE]] or UNKNOWN for each row; WHERE keeps only rows where it is TRUE.' },
    { id:'sql2-t2', term:'NULL', def:'A marker meaning a value is [[missing]] or [[unknown]]; it is {{not zero and not an empty string}}.' },
    { id:'sql2-t3', term:'Three-valued logic', def:'SQL logic where conditions can be TRUE, FALSE or [[UNKNOWN]]; {{any comparison with NULL yields UNKNOWN}}, so you test for it with [[IS NULL]].' },
    { id:'sql2-t4', term:'IN operator', def:'Tests whether a value matches [[any value]] in a [[list]] or subquery; a shorthand for several OR conditions.' },
    { id:'sql2-t5', term:'LIKE', def:'Pattern matching for text where [[%]] matches any sequence of characters and [[_]] matches exactly one character.' }
  ],
  code:[
    { id:'sql2-c1', task:'Find songs longer than 3 minutes (180 seconds).', lang:'sql', code:'SELECT title, duration_sec\nFROM songs\n[[WHERE]] duration_sec [[>]] 180;' },
    { id:'sql2-c2', task:'Find artists whose genre is missing.', lang:'sql', code:'SELECT name\nFROM artists\nWHERE genre [[IS NULL]];' },
    { id:'sql2-c3', task:'Show the top 5 positions on 2026-10-17.', lang:'sql', code:'SELECT chart_date, position, song_id\nFROM chart_entries\nWHERE chart_date = \'2026-10-17\'\n  [[AND]] position [[<=]] 5;' },
    { id:'sql2-c4', task:'Find artists in either the Hip-hop or the Alternative genre.', lang:'sql', code:'SELECT name\nFROM artists\nWHERE genre [[IN]] (\'Hip-hop\', \'Alternative\');' }
  ],
  problems:[
    { id:'sql2-p1', kind:'sql', title:'Data-quality check: missing streams',
      scenario:'Your dashboard shows a dip on one day. You suspect the source sent some rows without stream counts. Return the chart_date, position and song_id of every chart entry with missing streams.',
      hint:'Missing means NULL. Which operator tests for NULL?',
      solution:'SELECT chart_date, position, song_id\nFROM chart_entries\nWHERE streams IS NULL;',
      explain:'<code>WHERE streams = NULL</code> returns <b>zero rows</b> because comparing anything to NULL gives UNKNOWN. <code>IS NULL</code> is the only correct test. Checks like this are often scheduled as automated <b>data-quality tests</b> in pipelines (Module 4).' },
    { id:'sql2-p2', kind:'sql', title:'Short songs or love songs',
      scenario:'A playlist editor wants songs whose title starts with "Love" OR that are shorter than 2 minutes (120 seconds). Return the title.',
      hint:'LIKE with % for "starts with", and OR to combine the two conditions.',
      solution:'SELECT title\nFROM songs\nWHERE title LIKE \'Love%\'\n   OR duration_sec < 120;',
      explain:'<code>\'Love%\'</code> means "Love" followed by anything. OR keeps a row if <i>either</i> condition is TRUE. In SQLite, LIKE ignores case for ASCII letters. In Postgres it is case-sensitive, and you use <code>ILIKE</code> to ignore case.' }
  ]
},

{ id:'sql3', title:'Sorting, LIMIT, DISTINCT & query order',
  theory:{
    why:'In the relational model a table is a <b>set</b>: rows have <b>no built-in order</b>. The database may return them in whatever order is fastest, and that order can change between runs. If order matters (top 10, latest first), you must ask for it. To write correct queries you also need to know the order in which SQL <i>logically</i> evaluates its clauses, which differs from the order you type them.',
    body:[
      '<code>ORDER BY</code> sorts the result: <code>ASC</code> (the default) or <code>DESC</code>. You can sort by several columns: <code>ORDER BY chart_date DESC, position</code> sorts by date first and breaks ties by position.',
      '<code>LIMIT n</code> keeps the first n rows. With ORDER BY it gives <b>top-N</b> queries. Without ORDER BY, LIMIT returns an arbitrary n rows.',
      '<code>DISTINCT</code> removes duplicate result rows. It applies to the <i>whole selected row</i>, not just the first column.',
      '<b>Logical query order</b>: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Because SELECT runs after WHERE, standard SQL (Postgres, BigQuery) will not let WHERE use a column alias defined in SELECT, but ORDER BY can. SQLite and DuckDB are more lenient, so don\'t rely on that in interviews.'
    ],
    pro:'"Tables are unordered sets, so I add an explicit ORDER BY with a deterministic tie-breaker whenever the output order matters."',
    q:{ q:'Your query ORDER BY streams DESC LIMIT 3 returns different songs on different runs. Why could that happen?', a:'Ties. If two rows have the same streams, their relative order is undefined, so a different one may land at position 3. Add a tie-breaker such as ORDER BY streams DESC, song_id.' }
  },
  terms:[
    { id:'sql3-t1', term:'ORDER BY', def:'Sorts result rows by one or more expressions, [[ascending]] by default or [[DESC]] for descending; without it row order is [[not guaranteed]].' },
    { id:'sql3-t2', term:'LIMIT', def:'Returns only the first [[N rows]] of a result; combined with ORDER BY it produces [[top-N]] queries.' },
    { id:'sql3-t3', term:'DISTINCT', def:'Removes [[duplicate]] rows from the result, keeping one copy of each [[unique]] combination of the selected columns.' },
    { id:'sql3-t4', term:'Logical query order', def:'The order SQL clauses are conceptually evaluated: {{[[FROM]], WHERE, GROUP BY, HAVING, [[SELECT]], ORDER BY, LIMIT}}.' },
    { id:'sql3-t5', term:'Relation as a set', def:'A table is an [[unordered]] collection of rows, so any order you need must be requested with [[ORDER BY]].' }
  ],
  code:[
    { id:'sql3-c1', task:'Top 3 entries by streams on 2026-10-17.', lang:'sql', code:'SELECT song_id, streams\nFROM chart_entries\nWHERE chart_date = \'2026-10-17\'\n[[ORDER BY]] streams [[DESC]]\n[[LIMIT]] 3;' },
    { id:'sql3-c2', task:'List each genre once.', lang:'sql', code:'SELECT [[DISTINCT]] genre\nFROM artists;' },
    { id:'sql3-c3', task:'Sort chart entries newest date first, then by position.', lang:'sql', code:'SELECT chart_date, position, song_id\nFROM chart_entries\nORDER BY chart_date [[DESC]], [[position]];' }
  ],
  problems:[
    { id:'sql3-p1', kind:'sql', ordered:true, title:'Longest tracks',
      scenario:'Which 5 songs are the longest? Show title and duration_sec, longest first.',
      hint:'Sort descending, then keep 5 rows.',
      solution:'SELECT title, duration_sec\nFROM songs\nORDER BY duration_sec DESC\nLIMIT 5;',
      explain:'ORDER BY runs before LIMIT in the logical order, so the database sorts everything and then keeps 5 rows. Here the durations are all different. In real data, add a tie-breaker (for example <code>, title</code>) so the result is <b>deterministic</b>.' },
    { id:'sql3-p2', kind:'open', title:'Interview: why does this fail?',
      scenario:'In Postgres, this query errors: <pre>SELECT streams * 2 AS doubled\nFROM chart_entries\nWHERE doubled > 100000;</pre>Explain why, and fix it.',
      hint:'Think about the logical order of clauses.',
      solution:'SELECT streams * 2 AS doubled\nFROM chart_entries\nWHERE streams * 2 > 100000;\n\n-- or wrap it:\nSELECT * FROM (\n  SELECT streams * 2 AS doubled FROM chart_entries\n) t\nWHERE doubled > 100000;',
      explain:'WHERE is evaluated <b>before</b> SELECT, so the alias <code>doubled</code> doesn\'t exist yet when WHERE runs. Either repeat the expression, or compute it in a subquery or CTE and filter outside. Mentioning the "logical query processing order" by name is a strong interview signal.' }
  ]
},

{ id:'sql4', title:'Aggregation: GROUP BY & HAVING',
  theory:{
    why:'Business questions are usually <b>summaries</b>: total streams per day, number of songs per artist, average song length per genre. Nobody wants to read 30 raw rows to answer "who is winning?". Aggregation <b>collapses many rows into one row per group</b>.',
    body:[
      '<b>Aggregate functions</b> take many rows and return one value: <code>COUNT, SUM, AVG, MIN, MAX</code>. Without GROUP BY, the whole table is one group.',
      '<code>GROUP BY artist_id</code> makes one group per distinct artist_id. The golden rule: every column in SELECT must either be <b>in the GROUP BY</b> or <b>inside an aggregate</b>. Otherwise the database can\'t know which of the many values to show.',
      '<code>WHERE</code> filters <b>rows before</b> grouping; <code>HAVING</code> filters <b>groups after</b> aggregation. "Songs with more than 2 chart days" needs <code>HAVING COUNT(*) > 2</code>.',
      'Aggregates <b>ignore NULLs</b> (except <code>COUNT(*)</code>). So <code>COUNT(streams)</code> counts only non-NULL values, and <code>AVG(streams)</code> divides by the number of non-NULL values, which can surprise you.',
      'Always know the <b>grain</b> of a result, meaning what one row represents. chart_entries has a grain of "one song on one chart day".'
    ],
    pro:'"The output grain is one row per artist. I filtered rows with WHERE before aggregation and filtered groups with HAVING after."',
    q:{ q:'Freddy Kooger has streams 70000 and NULL. What is AVG(streams) for that song: 35000 or 70000?', a:'70000. AVG ignores NULLs, so it averages only the one known value. If missing should count as 0, write AVG(COALESCE(streams, 0)), which gives 35000. Decide deliberately.' }
  },
  terms:[
    { id:'sql4-t1', term:'Aggregate function', def:'A function that takes [[many rows]] and returns [[one value]], such as COUNT, SUM, AVG, MIN and MAX.' },
    { id:'sql4-t2', term:'GROUP BY', def:'Splits rows into [[groups]] that share the same values in the listed columns, then computes aggregates [[per group]].' },
    { id:'sql4-t3', term:'HAVING', def:'Filters [[groups]] after aggregation, while WHERE filters [[rows]] before grouping.' },
    { id:'sql4-t4', term:'Grain', def:'The level of detail of a table or result: what [[one row]] represents, for example {{one song on one chart day}}.' },
    { id:'sql4-t5', term:'COUNT(*) vs COUNT(column)', def:'COUNT(*) counts [[all rows]]; COUNT(column) counts only rows where that column is [[not NULL]].' }
  ],
  code:[
    { id:'sql4-c1', task:'Total streams for each chart date.', lang:'sql', code:'SELECT chart_date, [[SUM]](streams) AS total_streams\nFROM chart_entries\n[[GROUP BY]] chart_date;' },
    { id:'sql4-c2', task:'Songs that were on the chart on all 3 days.', lang:'sql', code:'SELECT song_id, COUNT(*) AS days_on_chart\nFROM chart_entries\nGROUP BY song_id\n[[HAVING]] COUNT(*) [[=]] 3;' },
    { id:'sql4-c3', task:'Compare total rows with rows that have a stream count.', lang:'sql', code:'SELECT COUNT(*) AS all_rows,\n       [[COUNT(streams)]] AS rows_with_streams\nFROM chart_entries;' },
    { id:'sql4-c4', task:'Number of artists per genre, biggest genre first.', lang:'sql', code:'SELECT genre, COUNT(*) AS artists\nFROM artists\nGROUP BY [[genre]]\nORDER BY artists [[DESC]];' }
  ],
  problems:[
    { id:'sql4-p1', kind:'sql', ordered:true, title:'Consistently big songs',
      scenario:'For each song_id, compute the average streams across its chart days (call it avg_streams). Keep only songs averaging more than 60000, highest first.',
      hint:'GROUP BY song_id, HAVING on AVG(streams), ORDER BY the alias.',
      solution:'SELECT song_id, AVG(streams) AS avg_streams\nFROM chart_entries\nGROUP BY song_id\nHAVING AVG(streams) > 60000\nORDER BY avg_streams DESC;',
      explain:'You can\'t use WHERE here because the condition is on an <b>aggregate</b>, which only exists after grouping, so you need HAVING. Song 12 (Freddy Kooger) qualifies with 70000 because AVG skipped its NULL day. In an interview, <b>point this out</b>: "AVG ignores NULLs; if missing should count as zero I\'d COALESCE first."' },
    { id:'sql4-p2', kind:'sql', title:'How many different songs charted?',
      scenario:'Return a single number, songs, the count of different songs that appeared on the chart at least once.',
      hint:'COUNT can take DISTINCT inside the parentheses.',
      solution:'SELECT COUNT(DISTINCT song_id) AS songs\nFROM chart_entries;',
      explain:'<code>COUNT(*)</code> would return 30 (rows), but the question asks about <b>distinct songs</b>, which is 13. Before you aggregate, check that you are counting at the right grain.' }
  ]
}
];

const SQL_LESSONS_B = [
{ id:'sql5', title:'JOINs',
  theory:{
    why:'Good database design <b>normalizes</b> data: artists, songs and chart entries live in separate tables so each fact is stored once. Questions, though, cut across tables ("which <i>artist</i> had the most <i>streams</i>?"). A JOIN puts the pieces back together at query time by matching keys.',
    body:[
      '<code>FROM chart_entries c JOIN songs s ON s.song_id = c.song_id</code> pairs every chart row with the song row that has the same key. <code>c</code> and <code>s</code> are <b>table aliases</b>.',
      '<b>INNER JOIN</b> (plain <code>JOIN</code>) keeps only rows that match on both sides. <b>LEFT JOIN</b> keeps <i>every</i> row from the left table, and when there is no match the right-side columns are NULL. Use it when you must not lose rows, such as "all artists, even those with no chart entries".',
      '<b>Anti-join</b>: to find rows with no match, LEFT JOIN and then <code>WHERE right.key IS NULL</code> (or use NOT EXISTS). Example: songs that never charted.',
      '<b>Fan-out</b>: joining a "one" row to "many" rows repeats the one row. If you then SUM a column from the "one" side, you double-count. Always ask what the grain is after the join.',
      'Watch out: a filter on the right table in WHERE (<code>WHERE s.duration_sec > 100</code>) removes the NULL rows a LEFT JOIN created and effectively turns it into an INNER JOIN. Put that condition in the ON clause if you want to keep the unmatched rows.'
    ],
    pro:'"I LEFT JOINed artists to songs so artists without songs are kept, checked for fan-out because it\'s one-to-many, and aggregated after the join at the artist grain."',
    q:{ q:'Your total streams per artist look 2× too high after adding a join to a table with one row per song per platform (Deezer and Spotify). What happened?', a:'Fan-out. Each chart row matched two platform rows, so every stream value was counted twice. Aggregate the platform table to one row per song before joining, or join on the platform as well.' }
  },
  terms:[
    { id:'sql5-t1', term:'JOIN', def:'Combines rows from two tables by matching values in [[related columns]], usually a foreign key to a [[primary key]].' },
    { id:'sql5-t2', term:'INNER JOIN', def:'Returns only rows that have a [[match]] in [[both]] tables.' },
    { id:'sql5-t3', term:'LEFT JOIN', def:'Returns [[all rows]] from the left table plus matching rows from the right; {{where there is no match the right-side columns are [[NULL]]}}.' },
    { id:'sql5-t4', term:'Anti-join', def:'A pattern that finds rows with [[no match]] in another table, e.g. LEFT JOIN then WHERE the right key [[IS NULL]].' },
    { id:'sql5-t5', term:'Fan-out', def:'When joining across a [[one-to-many]] relationship [[multiplies]] rows, which can inflate SUMs and COUNTs.' }
  ],
  code:[
    { id:'sql5-c1', task:'Show each song title with its artist name.', lang:'sql', code:'SELECT s.title, a.name\nFROM songs s\n[[JOIN]] artists a\n  [[ON]] s.artist_id = a.artist_id;' },
    { id:'sql5-c2', task:'List all artists with their songs, keeping artists that have none.', lang:'sql', code:'SELECT a.name, s.title\nFROM artists a\n[[LEFT JOIN]] songs s\n  ON s.artist_id = a.artist_id;' },
    { id:'sql5-c3', task:'Find songs that never appeared on the chart (anti-join).', lang:'sql', code:'SELECT s.title\nFROM songs s\nLEFT JOIN chart_entries c\n  ON c.song_id = s.song_id\nWHERE c.song_id [[IS NULL]];' },
    { id:'sql5-c4', task:'Show the 2026-10-17 chart with titles and artist names (3 tables).', lang:'sql', code:'SELECT c.position, s.title, a.name\nFROM chart_entries c\nJOIN songs s ON s.song_id = c.[[song_id]]\nJOIN artists a ON a.artist_id = s.[[artist_id]]\nWHERE c.chart_date = \'2026-10-17\';' }
  ],
  problems:[
    { id:'sql5-p1', kind:'sql', ordered:true, title:'Artist leaderboard',
      scenario:'Total streams per artist across all chart days. Show the artist name and total_streams, highest first.',
      hint:'chart_entries → songs → artists, then GROUP BY the artist.',
      solution:'SELECT a.name, SUM(c.streams) AS total_streams\nFROM chart_entries c\nJOIN songs s   ON s.song_id = c.song_id\nJOIN artists a ON a.artist_id = s.artist_id\nGROUP BY a.artist_id, a.name\nORDER BY total_streams DESC;',
      explain:'Join down to the grain you need, then aggregate. Grouping by <code>artist_id</code> as well as the name protects you if two artists share a name. Ayra Starr comes first because <b>two</b> of her songs charted. This kind of insight is what the artist_summary view in your pipeline is for.' },
    { id:'sql5-p2', kind:'sql', title:'Every artist, even with zero entries',
      scenario:'List every artist\'s name and their number of chart entries (call it entries). Artists with no chart entries must show 0.',
      hint:'LEFT JOIN twice, and count a column from the right-most table, not *.',
      solution:'SELECT a.name, COUNT(c.song_id) AS entries\nFROM artists a\nLEFT JOIN songs s         ON s.artist_id = a.artist_id\nLEFT JOIN chart_entries c ON c.song_id = s.song_id\nGROUP BY a.artist_id, a.name;',
      explain:'<code>COUNT(*)</code> would give Burna Boy, Tems and Rema <b>1</b>, because the LEFT JOIN still produces one row for each of them, filled with NULLs. <code>COUNT(c.song_id)</code> ignores NULLs and correctly returns 0. This is a very common interview trap.' }
  ]
},

{ id:'sql6', title:'Subqueries',
  theory:{
    why:'Some questions need a value you have to <b>compute first</b>. "Songs longer than <i>average</i>" means you need the average before you can compare. A subquery is a query inside another query, and its result feeds the outer one, like a function call.',
    body:[
      'A <b>scalar subquery</b> returns one row and one column, so it can stand in for a single value: <code>WHERE duration_sec > (SELECT AVG(duration_sec) FROM songs)</code>.',
      'An <b>IN subquery</b> returns a list: <code>WHERE artist_id IN (SELECT artist_id FROM songs WHERE …)</code>.',
      'A <b>derived table</b> is a subquery in FROM that acts as a temporary table. It needs an alias: <code>FROM (…) AS t</code>.',
      'A <b>correlated subquery</b> refers to the outer row (<code>WHERE c.song_id = s.song_id</code>), so logically it runs once per outer row. <code>EXISTS</code> is the usual correlated form. It returns TRUE as soon as one row matches, and the selected values (often <code>SELECT 1</code>) don\'t matter.',
      '⚠️ <code>NOT IN</code> trap: if the subquery returns any NULL, <code>x NOT IN (…)</code> is never TRUE, so you get zero rows. Prefer <code>NOT EXISTS</code>, or filter the NULLs out.'
    ],
    pro:'"I used a correlated NOT EXISTS instead of NOT IN, because NOT IN returns nothing if the subquery contains a NULL."',
    q:{ q:'Why must a scalar subquery return only one row?', a:'Because it is used where a single value is expected (for example on one side of >). If it returned many rows, the comparison would be ambiguous. Postgres raises an error, and SQLite silently takes the first row, which is a bug waiting to happen.' }
  },
  terms:[
    { id:'sql6-t1', term:'Subquery', def:'A [[query nested]] inside another statement whose result is used by the [[outer query]].' },
    { id:'sql6-t2', term:'Scalar subquery', def:'A subquery that returns exactly [[one row and one column]], so it can be used like a [[single value]].' },
    { id:'sql6-t3', term:'Correlated subquery', def:'A subquery that [[references columns]] of the outer query, so it is logically evaluated [[once per outer row]].' },
    { id:'sql6-t4', term:'EXISTS', def:'Returns TRUE if the subquery returns [[at least one row]]; it {{does not care about the values}} returned.' },
    { id:'sql6-t5', term:'Derived table', def:'A subquery in the [[FROM]] clause that acts like a temporary table and usually needs an [[alias]].' }
  ],
  code:[
    { id:'sql6-c1', task:'Songs longer than the average song.', lang:'sql', code:'SELECT title, duration_sec\nFROM songs\nWHERE duration_sec > (SELECT [[AVG]](duration_sec) FROM [[songs]]);' },
    { id:'sql6-c2', task:'Artists who have at least one song over 200 seconds.', lang:'sql', code:'SELECT name\nFROM artists\nWHERE artist_id [[IN]] (\n  SELECT artist_id FROM songs WHERE duration_sec > 200\n);' },
    { id:'sql6-c3', task:'Songs that have been #1 at least once (EXISTS).', lang:'sql', code:'SELECT s.title\nFROM songs s\nWHERE [[EXISTS]] (\n  SELECT 1 FROM chart_entries c\n  WHERE c.song_id = [[s.song_id]] AND c.position = 1\n);' },
    { id:'sql6-c4', task:'Average number of chart days per song, using a derived table.', lang:'sql', code:'SELECT AVG(n) AS avg_days_per_song\nFROM (\n  SELECT song_id, COUNT(*) AS n\n  FROM chart_entries\n  GROUP BY song_id\n) [[AS]] t;' }
  ],
  problems:[
    { id:'sql6-p1', kind:'sql', title:'Above the day\'s average',
      scenario:'On 2026-10-17, which chart entries had more streams than that day\'s average? Return position and streams.',
      hint:'Compare streams to a scalar subquery that computes AVG for the same date.',
      solution:'SELECT position, streams\nFROM chart_entries\nWHERE chart_date = \'2026-10-17\'\n  AND streams > (\n    SELECT AVG(streams)\n    FROM chart_entries\n    WHERE chart_date = \'2026-10-17\'\n  );',
      explain:'The inner query computes one number (72,600). The outer query compares each row with it. Both need the date filter, or you\'d be comparing against the all-time average. Later you\'ll do this for <i>every</i> date at once with a window function: <code>AVG(streams) OVER (PARTITION BY chart_date)</code>.' },
    { id:'sql6-p2', kind:'sql', title:'Charted, but never top 3',
      scenario:'Return the title of every song that appeared on the chart but never reached position 3 or better.',
      hint:'Two conditions: EXISTS (a chart row) AND NOT EXISTS (a chart row with position <= 3).',
      solution:'SELECT s.title\nFROM songs s\nWHERE EXISTS (SELECT 1 FROM chart_entries c WHERE c.song_id = s.song_id)\n  AND NOT EXISTS (\n    SELECT 1 FROM chart_entries c\n    WHERE c.song_id = s.song_id AND c.position <= 3\n  );',
      explain:'EXISTS and NOT EXISTS read like plain English and handle NULLs safely. <code>song_id NOT IN (SELECT song_id … WHERE position <= 3)</code> also works here, but only because song_id is never NULL. Say that out loud in interviews.' }
  ]
},

{ id:'sql7', title:'CTEs (WITH)',
  theory:{
    why:'Nested subqueries quickly become unreadable, because you have to read them inside-out. A <b>Common Table Expression</b> gives a step a name so the query reads <b>top-down, like a pipeline</b>: first build this, then that, then the answer. dbt models (Module 6) and the transform steps of an ETL job use the same idea.',
    body:[
      '<code>WITH daily AS (SELECT …) SELECT * FROM daily</code>. The CTE exists only for that one statement.',
      'Chain several CTEs with commas. Each can use the ones defined before it: <code>WITH a AS (…), b AS (SELECT … FROM a) SELECT … FROM b</code>.',
      'You can reference a CTE more than once, which avoids copy-pasting the same subquery.',
      'A <b>recursive CTE</b> (<code>WITH RECURSIVE</code>) refers to itself. It has an <b>anchor</b> query and a <b>recursive</b> query joined by <code>UNION ALL</code>, and it repeats until the recursive part returns no rows. Use it for hierarchies (an org chart) or to generate sequences, such as every date in a range, to find missing chart days.',
      '<code>UNION ALL</code> stacks rows and keeps duplicates. <code>UNION</code> removes duplicates, which costs a sort or hash, so use UNION ALL unless you need deduplication.'
    ],
    pro:'"I broke the logic into CTEs, one per transformation step, so each step can be tested on its own and the final SELECT reads like the business question."',
    q:{ q:'What is the advantage of a CTE over a temporary table you create first?', a:'A CTE needs no extra objects or cleanup and lives inside one statement, so the query is self-contained and easy to version-control. Temp tables persist for the session and can be indexed or reused across statements, which can help with very heavy intermediate results.' }
  },
  terms:[
    { id:'sql7-t1', term:'CTE', def:'A Common Table Expression: a [[named temporary result]] defined with [[WITH]] that exists only for {{the duration of one statement}}.' },
    { id:'sql7-t2', term:'Chained CTEs', def:'Several CTEs separated by [[commas]] where each one [[builds on the previous]], turning a complex query into readable steps.' },
    { id:'sql7-t3', term:'Recursive CTE', def:'A CTE that [[references itself]], with an anchor part and a recursive part joined by [[UNION ALL]], used for hierarchies or sequences.' },
    { id:'sql7-t4', term:'UNION ALL vs UNION', def:'UNION ALL stacks rows and [[keeps duplicates]]; UNION also [[removes duplicates]], which makes it slower.' }
  ],
  code:[
    { id:'sql7-c1', task:'Daily totals as a CTE, then keep days above 690,000 streams.', lang:'sql', code:'[[WITH]] daily AS (\n  SELECT chart_date, SUM(streams) AS total\n  FROM chart_entries\n  GROUP BY chart_date\n)\nSELECT * FROM [[daily]]\nWHERE total > 690000;' },
    { id:'sql7-c2', task:'Two chained CTEs: streams per artist, then attach names; show the top 3.', lang:'sql', code:'WITH artist_streams AS (\n  SELECT s.artist_id, SUM(c.streams) AS total\n  FROM chart_entries c\n  JOIN songs s ON s.song_id = c.song_id\n  GROUP BY s.artist_id\n)[[,]]\nnamed AS (\n  SELECT a.name, x.total\n  FROM [[artist_streams]] x\n  JOIN artists a ON a.artist_id = x.artist_id\n)\nSELECT * FROM named\nORDER BY total DESC\nLIMIT 3;' },
    { id:'sql7-c3', task:'Generate the numbers 1 to 7 with a recursive CTE.', lang:'sql', code:'WITH [[RECURSIVE]] days(n) AS (\n  SELECT 1\n  [[UNION ALL]]\n  SELECT n + 1 FROM days WHERE n < 7\n)\nSELECT n FROM days;' }
  ],
  problems:[
    { id:'sql7-p1', kind:'sql', title:'How dominant is #1?',
      scenario:'For each chart_date, what percentage of that day\'s total streams went to the #1 song? Return chart_date and pct_top1, rounded to 1 decimal place.',
      hint:'CTE 1: daily totals. CTE 2: the #1 row per day. Join them and divide. Watch out for integer division.',
      solution:'WITH daily AS (\n  SELECT chart_date, SUM(streams) AS total\n  FROM chart_entries\n  GROUP BY chart_date\n),\ntop1 AS (\n  SELECT chart_date, streams\n  FROM chart_entries\n  WHERE position = 1\n)\nSELECT t.chart_date,\n       ROUND(100.0 * t.streams / d.total, 1) AS pct_top1\nFROM top1 t\nJOIN daily d ON d.chart_date = t.chart_date;',
      explain:'<code>100.0 *</code> forces decimal maths. <code>t.streams / d.total</code> on two INTEGERs would give 0 in SQLite and Postgres (integer division). Naming the steps <code>daily</code> and <code>top1</code> makes the logic easy to check, which is exactly how dbt models are written.' }
  ]
},

{ id:'sql8', title:'Window functions',
  theory:{
    why:'GROUP BY answers "total per group", but it <b>throws away the individual rows</b>. Many questions need both the row and a calculation over related rows: a song\'s position <i>and</i> its position yesterday, a rank within the day, a running total. <b>Window functions</b> compute over a "window" of rows <b>without collapsing</b> them. Your chart_movement view uses one: <code>LAG(position)</code>.',
    body:[
      'Syntax: <code>FUNCTION() OVER (PARTITION BY … ORDER BY … frame)</code>. <b>PARTITION BY</b> splits rows into independent groups (like GROUP BY, but the rows stay). <b>ORDER BY</b> inside OVER sets the order within each partition.',
      '<b>Ranking</b>: <code>ROW_NUMBER()</code> gives 1,2,3,4 even for ties. <code>RANK()</code> gives 1,2,2,4 (ties share, then it skips). <code>DENSE_RANK()</code> gives 1,2,2,3 (no gaps).',
      '<b>Offset</b>: <code>LAG(col)</code> reads the previous row\'s value and <code>LEAD(col)</code> the next one. The first row of a partition has no previous row, so LAG returns NULL. That\'s how "NEW entry" shows up in your movement view.',
      '<b>Aggregates as windows</b>: <code>SUM(streams) OVER (PARTITION BY song_id ORDER BY chart_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)</code> is a running total. <code>AVG(streams) OVER (PARTITION BY chart_date)</code> puts the day\'s average on every row.',
      'Window functions run <b>after WHERE and GROUP BY</b>, so you can\'t filter on them in WHERE. Wrap the query in a CTE and filter outside. This is the classic <b>top-N per group</b> and <b>deduplication</b> pattern: <code>ROW_NUMBER() … AS rn</code>, then <code>WHERE rn = 1</code>.'
    ],
    pro:'"I partitioned by song_id and ordered by chart_date, then used LAG to get the previous day\'s position. The first appearance returns NULL, which we label as a new entry."',
    q:{ q:'If you filter WHERE chart_date = \'2026-10-17\' in the same query as LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date), what goes wrong?', a:'WHERE runs before the window function, so only the 10-17 rows exist when LAG is calculated. There is no previous row, and every prev_position is NULL. Compute LAG in a CTE over all dates first, then filter to the date outside.' }
  },
  terms:[
    { id:'sql8-t1', term:'Window function', def:'A function that computes a value across a [[set of related rows]] while [[keeping every row]] in the result, defined with OVER().' },
    { id:'sql8-t2', term:'PARTITION BY', def:'Splits rows into [[independent groups]] for a window function, like GROUP BY but [[without collapsing]] the rows.' },
    { id:'sql8-t3', term:'LAG', def:'Returns a value from a [[previous row]] in the window\'s order, such as yesterday\'s chart position; it returns [[NULL]] when there is no previous row.' },
    { id:'sql8-t4', term:'ROW_NUMBER vs RANK vs DENSE_RANK', def:'ROW_NUMBER gives [[unique]] numbers even for ties; RANK gives ties the same number and [[skips]] the next; DENSE_RANK gives ties the same number [[without gaps]].' },
    { id:'sql8-t5', term:'Window frame', def:'The rows within a partition used for each calculation, e.g. ROWS BETWEEN [[UNBOUNDED PRECEDING]] AND [[CURRENT ROW]] for a running total.' }
  ],
  code:[
    { id:'sql8-c1', task:'Each entry with the song\'s previous chart position (your pipeline\'s movement logic).', lang:'sql', code:'SELECT chart_date, song_id, position,\n  [[LAG]](position) OVER (\n    [[PARTITION BY]] song_id\n    ORDER BY chart_date\n  ) AS prev_position\nFROM chart_entries;' },
    { id:'sql8-c2', task:'Rank entries by streams within each chart date.', lang:'sql', code:'SELECT chart_date, song_id, streams,\n  [[RANK]]() OVER (PARTITION BY chart_date\n               ORDER BY streams [[DESC]]) AS stream_rank\nFROM chart_entries;' },
    { id:'sql8-c3', task:'Running total of streams per song over time.', lang:'sql', code:'SELECT chart_date, song_id, streams,\n  SUM(streams) OVER (\n    PARTITION BY song_id\n    ORDER BY chart_date\n    ROWS BETWEEN [[UNBOUNDED PRECEDING]] AND [[CURRENT ROW]]\n  ) AS running_streams\nFROM chart_entries;' },
    { id:'sql8-c4', task:'Each artist\'s single best chart entry by streams (top-1 per group).', lang:'sql', code:'WITH ranked AS (\n  SELECT s.artist_id, c.chart_date, c.song_id, c.streams,\n    [[ROW_NUMBER]]() OVER (\n      PARTITION BY s.artist_id ORDER BY c.streams DESC\n    ) AS rn\n  FROM chart_entries c\n  JOIN songs s ON s.song_id = c.song_id\n)\nSELECT * FROM ranked\nWHERE [[rn = 1]];' }
  ],
  problems:[
    { id:'sql8-p1', kind:'sql', title:'Today\'s biggest climbers',
      scenario:'For 2026-10-17, show title, position, prev_position (the song\'s position on its previous chart day) and places_gained (prev_position − position). Exclude new entries (no previous day).',
      hint:'A CTE over ALL dates computes LAG. Outside it, filter the date and prev_position IS NOT NULL. Join songs for the title.',
      solution:'WITH movement AS (\n  SELECT chart_date, song_id, position,\n    LAG(position) OVER (\n      PARTITION BY song_id ORDER BY chart_date\n    ) AS prev_position\n  FROM chart_entries\n)\nSELECT s.title, m.position, m.prev_position,\n       m.prev_position - m.position AS places_gained\nFROM movement m\nJOIN songs s ON s.song_id = m.song_id\nWHERE m.chart_date = \'2026-10-17\'\n  AND m.prev_position IS NOT NULL;',
      explain:'The key is the <b>order of operations</b>: compute LAG over the full history, <i>then</i> filter. A lower position number is better, so places gained = prev − current. "Goodbye (Warm Up)" and "Love Na Drug" each climbed 2. This is exactly your pipeline\'s chart_movement view.' },
    { id:'sql8-p2', kind:'sql', title:'Deduplicate a messy load',
      setup:'CREATE TABLE raw_loads (chart_date TEXT, song_id INTEGER, position INTEGER, loaded_at TEXT);\nINSERT INTO raw_loads VALUES\n (\'2026-10-17\',1,1,\'06:00\'),(\'2026-10-17\',1,1,\'06:05\'),\n (\'2026-10-17\',2,3,\'06:00\'),(\'2026-10-17\',2,2,\'06:05\'),\n (\'2026-10-17\',3,3,\'06:05\');',
      scenario:'A retry loaded some rows twice into <code>raw_loads(chart_date, song_id, position, loaded_at)</code>. Keep only the <b>latest loaded</b> row per (chart_date, song_id). Return chart_date, song_id, position.',
      hint:'ROW_NUMBER() OVER (PARTITION BY chart_date, song_id ORDER BY loaded_at DESC), then keep rn = 1.',
      solution:'WITH ranked AS (\n  SELECT *,\n    ROW_NUMBER() OVER (\n      PARTITION BY chart_date, song_id\n      ORDER BY loaded_at DESC\n    ) AS rn\n  FROM raw_loads\n)\nSELECT chart_date, song_id, position\nFROM ranked\nWHERE rn = 1;',
      explain:'This is the most common data engineering interview SQL pattern. PARTITION BY the <b>business key</b>, ORDER BY a recency column, and keep row 1. Use ROW_NUMBER, not RANK: if two rows had the same loaded_at, RANK would keep both.' }
  ]
},

{ id:'sql9', title:'CASE, COALESCE & CAST (cleaning in SQL)',
  theory:{
    why:'Real source data is messy: missing values, numbers stored as text, categories you have to derive. Much of a data engineer\'s <b>transform</b> step is plain SQL that cleans and labels data. You need if/else logic, defaults for NULLs and type conversion, all inside a query.',
    body:[
      '<code>CASE WHEN cond THEN x WHEN cond2 THEN y ELSE z END</code> is SQL\'s if/else. It returns the result of the <b>first</b> true WHEN, and NULL if none match and there is no ELSE.',
      '<code>COALESCE(a, b, c)</code> returns the first non-NULL argument: <code>COALESCE(streams, 0)</code>.',
      '<code>CAST(\'42\' AS INTEGER)</code> converts types. Sources such as CSVs and APIs often send numbers as text.',
      '<code>NULLIF(a, b)</code> returns NULL when a = b. <code>x / NULLIF(y, 0)</code> avoids division-by-zero errors.',
      '<b>Integer division</b>: <code>7 / 2</code> is 3 in SQLite and Postgres. Multiply by <code>1.0</code> or CAST to a decimal type first.',
      '<b>Conditional aggregation</b>: <code>SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END)</code> counts matching rows inside a GROUP BY. It\'s a pivot without a PIVOT keyword.'
    ],
    pro:'"I standardized the data in the transform layer: COALESCE for missing counts, CAST for text numbers, and CASE to derive a length band."',
    q:{ q:'Should a pipeline replace NULL streams with 0?', a:'Only if 0 is true in business terms. NULL means "we don\'t know", and 0 claims "nobody streamed it". Usually you keep NULL in the warehouse, flag it with a data-quality check, and let each report decide.' }
  },
  terms:[
    { id:'sql9-t1', term:'CASE expression', def:'SQL\'s [[if-then-else]]: it returns the result of the [[first]] WHEN condition that is true, otherwise the ELSE value or NULL.' },
    { id:'sql9-t2', term:'COALESCE', def:'Returns the [[first non-NULL]] value from its arguments; used to replace missing values with a [[default]].' },
    { id:'sql9-t3', term:'CAST', def:'Converts a value from one [[data type]] to another, for example [[text]] to INTEGER.' },
    { id:'sql9-t4', term:'NULLIF', def:'Returns NULL if its two arguments are [[equal]], otherwise the first one; often used to avoid [[division by zero]].' },
    { id:'sql9-t5', term:'Integer division', def:'Dividing two [[integers]] [[discards the remainder]] in many databases, so 7 / 2 = 3; multiply by 1.0 to get decimals.' }
  ],
  code:[
    { id:'sql9-c1', task:'Label each song short, medium or long.', lang:'sql', code:'SELECT title,\n  [[CASE]]\n    WHEN duration_sec < 150 THEN \'short\'\n    WHEN duration_sec < 200 THEN \'medium\'\n    [[ELSE]] \'long\'\n  [[END]] AS length_band\nFROM songs;' },
    { id:'sql9-c2', task:'Replace missing stream counts with 0.', lang:'sql', code:'SELECT chart_date, song_id,\n  [[COALESCE]](streams, 0) AS streams_filled\nFROM chart_entries;' },
    { id:'sql9-c3', task:'Convert the text \'42\' to a number and add 1.', lang:'sql', code:'SELECT [[CAST]](\'42\' AS [[INTEGER]]) + 1 AS answer;' },
    { id:'sql9-c4', task:'Streams that went to the top 3 songs each day (conditional aggregation).', lang:'sql', code:'SELECT chart_date,\n  SUM(CASE WHEN position <= 3 THEN [[streams]] ELSE 0 END) AS top3_streams\nFROM chart_entries\nGROUP BY [[chart_date]];' }
  ],
  problems:[
    { id:'sql9-p1', kind:'sql', title:'Top-5 vs the rest, per artist',
      scenario:'For each artist name, count chart entries inside the top 5 (top5_entries) and outside it (other_entries). Only include artists that charted.',
      hint:'JOIN chart_entries → songs → artists, GROUP BY artist, and use SUM(CASE WHEN … THEN 1 ELSE 0 END) twice.',
      solution:'SELECT a.name,\n  SUM(CASE WHEN c.position <= 5 THEN 1 ELSE 0 END) AS top5_entries,\n  SUM(CASE WHEN c.position > 5 THEN 1 ELSE 0 END)  AS other_entries\nFROM chart_entries c\nJOIN songs s   ON s.song_id = c.song_id\nJOIN artists a ON a.artist_id = s.artist_id\nGROUP BY a.artist_id, a.name;',
      explain:'<b>Conditional aggregation</b> turns rows into columns in one pass over the data. It\'s cheaper than running two queries and joining them. Postgres also has <code>COUNT(*) FILTER (WHERE …)</code> for the same thing.' }
  ]
}
];

const ETL_LESSONS = [
{ id:'etl1', title:'What a pipeline is: ETL vs ELT',
  theory:{
    why:'Data is created in <b>operational systems</b>: apps, payment databases, the Deezer API. Those systems are built to run the business, not to analyse it. Their data is spread out, shaped for transactions, and often overwritten (the API only shows <i>today\'s</i> chart). Analysts need data that is <b>combined, cleaned and kept over time</b>. A <b>pipeline</b> moves and reshapes data from sources to a destination automatically and repeatably.',
    body:[
      '<b>Extract</b>: read from the source (API, database, files). <b>Transform</b>: clean, reshape, join, validate. <b>Load</b>: write into the target (warehouse, lake).',
      '<b>ETL</b> transforms <i>before</i> loading. It was the classic choice when warehouse storage and compute were expensive. <b>ELT</b> loads raw data first and transforms <i>inside</i> the warehouse with SQL, which became common with cheap cloud storage and tools like dbt.',
      'A <b>raw layer</b> (landing zone) keeps the source data exactly as received. If you find a bug in your transform next month, you can <b>replay</b> from raw instead of losing history. Your pipeline does this with <code>data/raw/top_nigeria_YYYY-MM-DD.json</code>.',
      'Layers are often named <b>raw → staging → marts</b> (or bronze → silver → gold): untouched, then cleaned, then business-ready.'
    ],
    pro:'"My pipeline is ETL with a raw landing layer. It extracts the Deezer chart, stores the JSON untouched for replay, transforms and validates in Python, and loads idempotently into DuckDB."',
    q:{ q:'Why keep the raw JSON if you already loaded clean rows?', a:'Because transforms change and have bugs, and the source API won\'t give you yesterday\'s chart again. Raw data lets you rebuild history with new logic (a backfill) and debug what the source actually sent.' }
  },
  terms:[
    { id:'etl1-t1', term:'Extract', def:'Reading data out of a [[source system]] such as an API, database or file, ideally [[without changing]] it.' },
    { id:'etl1-t2', term:'Transform', def:'Cleaning, [[reshaping]], joining and validating data so it fits the [[target model]].' },
    { id:'etl1-t3', term:'Load', def:'Writing the prepared data into the [[target]] system, such as a [[data warehouse]] table.' },
    { id:'etl1-t4', term:'ELT', def:'A pattern where raw data is [[loaded first]] and then transformed [[inside the warehouse]], usually with SQL tools like dbt.' },
    { id:'etl1-t5', term:'Raw layer (landing zone)', def:'Storage for source data [[exactly as received]], so the pipeline can be [[replayed]] if the transform logic changes.' }
  ],
  code:[
    { id:'etl1-c1', task:'Extract: call the API safely and parse JSON (Python requests).', lang:'python', code:'import requests\n\nresp = requests.[[get]](url, timeout=30)\nresp.[[raise_for_status]]()\ndata = resp.[[json]]()' },
    { id:'etl1-c2', task:'Save the raw response untouched, one file per run date.', lang:'python', code:'import json\n\nwith open(f"data/raw/top_nigeria_{run_date}.json", "[[w]]") as f:\n    json.[[dump]](data, f)' },
    { id:'etl1-c3', task:'Transform: flatten the nested tracks into rows with a position.', lang:'python', code:'rows = []\nfor i, t in [[enumerate]](data["tracks"], start=1):\n    rows.append({\n        "position": i,\n        "title": t["title"].[[strip]](),\n        "artist": t["artist"]["name"],\n    })' }
  ],
  problems:[
    { id:'etl1-p1', kind:'open', title:'Interview: ETL or ELT?',
      scenario:'An interviewer asks: "Is your Deezer chart pipeline ETL or ELT? How would you change it to ELT, and why might you?" Write your answer (3–5 sentences).',
      hint:'Where does the transformation happen today? What would move into the warehouse?',
      solution:'It\'s ETL: Python transform.py cleans and validates the data before load.py writes to DuckDB, though I also keep the raw JSON for replay. To make it ELT, I\'d load the raw JSON straight into a raw table in DuckDB or BigQuery, then do the flattening, cleaning and quality tests in SQL, for example as dbt models (raw → staging → marts). The benefits are that transformations live in version-controlled SQL that analysts can read, the warehouse does the heavy compute, and I can re-transform history without re-extracting.',
      explain:'A good answer <b>names the pattern</b>, <b>points to where it happens in your code</b>, and gives a <b>trade-off</b>. ELT is the modern default in cloud warehouses. ETL still makes sense when you must clean or mask data (e.g. personal data) before it lands.' }
  ]
},

{ id:'etl2', title:'Idempotency & incremental loads',
  theory:{
    why:'Pipelines <b>fail and get re-run</b>. The network drops, an API times out, a scheduler retries, or you re-run yesterday by hand. If a re-run inserts the same rows again, every total is wrong and nobody notices until a stakeholder does. The fix is to design every job to be <b>idempotent</b>: running it once or ten times for the same input gives the same result.',
    body:[
      '<b>Delete-then-insert per partition</b>: remove the rows for the run date, then insert the fresh ones, inside one transaction. Your <code>load.py</code> does this: <code>DELETE … WHERE chart_date = ?</code>, then INSERT.',
      '<b>Upsert / MERGE</b>: insert new keys and update existing ones based on a unique key. In SQLite, Postgres and DuckDB: <code>INSERT … ON CONFLICT (key) DO UPDATE</code>. In BigQuery and Snowflake: <code>MERGE</code>.',
      '<b>Full refresh</b> rebuilds the whole table each run. It\'s simple, but it gets slow and expensive as data grows. An <b>incremental load</b> processes only new or changed data. It uses a <b>watermark</b>, the last processed timestamp or ID, stored so the next run knows where to resume.',
      'A <b>backfill</b> re-runs the pipeline for past dates, to fill gaps or apply new logic. Backfills are only safe if the job is idempotent and parameterized by date (<code>run_pipeline.py --date 2026-10-15</code>), not hard-wired to "today".'
    ],
    pro:'"Loads are idempotent: I delete-and-insert the run date\'s partition in a single transaction, so retries and backfills can\'t create duplicates."',
    q:{ q:'Why is "INSERT the new rows" alone not idempotent, even if the data is correct?', a:'Running it twice inserts the rows twice. The result depends on how many times it ran, not only on the input. Idempotency needs a key-aware write (upsert) or a replace of the partition (delete+insert / overwrite).' }
  },
  terms:[
    { id:'etl2-t1', term:'Idempotency', def:'A property where running a job [[multiple times]] with the same input produces the [[same result]] as running it once.' },
    { id:'etl2-t2', term:'Upsert (MERGE)', def:'An operation that [[updates]] a row if its key already exists and [[inserts]] it otherwise.' },
    { id:'etl2-t3', term:'Incremental load', def:'Loading only data that is [[new or changed]] since the last run, instead of a [[full refresh]].' },
    { id:'etl2-t4', term:'Watermark', def:'The [[last processed]] value, such as a timestamp or ID, stored so the next run knows [[where to resume]].' },
    { id:'etl2-t5', term:'Backfill', def:'Re-running a pipeline for [[past dates]] to fill gaps or apply new logic to [[historical data]].' }
  ],
  code:[
    { id:'etl2-c1', task:'Idempotent upsert of one chart row (SQLite / Postgres / DuckDB syntax).', lang:'sql', show:'SELECT * FROM chart_entries WHERE chart_date = \'2026-10-17\' AND song_id = 1;',
      code:'INSERT INTO chart_entries (chart_date, song_id, position, streams)\nVALUES (\'2026-10-17\', 1, 1, 109500)\n[[ON CONFLICT]] (chart_date, song_id)\nDO [[UPDATE]] SET position = excluded.position,\n                streams  = excluded.streams;' },
    { id:'etl2-c2', task:'Replace one day\'s partition atomically (delete + insert in a transaction).', lang:'sql', run:false,
      code:'BEGIN;\n[[DELETE]] FROM chart_entries WHERE chart_date = \'2026-10-17\';\nINSERT INTO chart_entries SELECT * FROM staging_chart;\n[[COMMIT]];' },
    { id:'etl2-c3', task:'Incremental load with a watermark (Python).', lang:'python',
      code:'last = get_watermark("chart_entries")   # e.g. "2026-10-16"\nnew_rows = [r for r in rows if r["chart_date"] [[>]] last]\nload(new_rows)\nset_watermark("chart_entries", [[max]](r["chart_date"] for r in new_rows))' }
  ],
  problems:[
    { id:'etl2-p1', kind:'open', title:'The double run',
      scenario:'Your GitHub Actions job ran <b>twice</b> on 2026-10-17 (a manual re-run after a timeout). The load step is: <pre>con.executemany("INSERT INTO chart_entries VALUES (?,?,?,?)", rows)</pre>The table has no primary key. (1) What happens to the dashboard? (2) Give two ways to make this load idempotent.',
      hint:'Count the rows for that date after two runs. Think: delete+insert, or upsert with a key.',
      solution:'(1) Every 2026-10-17 row is inserted twice, so the day has 20 rows instead of 10 and SUM(streams) doubles. Charts and leaderboards are silently wrong.\n\n(2a) Delete-then-insert the partition in one transaction:\nBEGIN;\nDELETE FROM chart_entries WHERE chart_date = ?;\nINSERT INTO chart_entries VALUES (?,?,?,?);  -- executemany\nCOMMIT;\n\n(2b) Add PRIMARY KEY (chart_date, song_id) and upsert:\nINSERT INTO chart_entries VALUES (?,?,?,?)\nON CONFLICT (chart_date, song_id) DO UPDATE SET\n  position = excluded.position, streams = excluded.streams;\n\nAlso add a data-quality check: fail if any (chart_date, song_id) appears more than once.',
      explain:'A <b>primary key</b> is also a safety net: the database rejects duplicates even if the code has a bug. The transaction matters too. Without it, a crash between DELETE and INSERT leaves the day empty.' }
  ]
},

{ id:'etl3', title:'Batch vs streaming',
  theory:{
    why:'The real question is: <b>how fresh does this data need to be?</b> A daily chart report is fine with data from this morning. A fraud check on a card payment needs an answer in milliseconds. Freshness costs money and complexity, so you pick the simplest approach that meets the need.',
    body:[
      '<b>Batch</b> processes a <b>bounded</b> chunk of data on a schedule, such as "all of yesterday" or "today\'s chart at 06:00". It\'s simple to build, test, re-run and backfill. Most entry-level DE work is batch.',
      '<b>Streaming</b> processes an <b>unbounded</b> flow of events as they arrive (plays, clicks, payments), usually through a <b>message broker</b> like Kafka. Producers write events to <b>topics</b>, and consumers read them at their own pace.',
      '<b>Latency</b> is the delay from when an event happens to when the data can be used. Batch latency is minutes to hours, streaming is seconds or less. <b>Micro-batch</b> (for example every 5 minutes) sits in between.',
      'Streaming brings hard problems: <b>late-arriving data</b> (a phone comes back online and sends yesterday\'s plays), out-of-order events, and delivery guarantees (<b>at-least-once</b> can produce duplicates, so consumers must be idempotent).'
    ],
    pro:'"The chart only updates daily, so a scheduled batch job with a cron trigger meets the freshness need at minimal cost. Streaming would add complexity without any business value here."',
    q:{ q:'Deezer\'s chart API updates once a day. Would streaming make your pipeline better?', a:'No. The source itself changes daily, so polling every second gives the same data again and again. Freshness is limited by the source. Choose batch and run it soon after the source updates.' }
  },
  terms:[
    { id:'etl3-t1', term:'Batch processing', def:'Processing a [[bounded]] set of data at scheduled intervals, such as [[once a day]].' },
    { id:'etl3-t2', term:'Stream processing', def:'Processing an [[unbounded]], continuous flow of events [[as they arrive]], with low latency.' },
    { id:'etl3-t3', term:'Latency (data freshness)', def:'The [[delay]] between when data is created and when it is [[available]] for use.' },
    { id:'etl3-t4', term:'Kafka (message broker)', def:'A distributed [[event log]] where producers write messages to [[topics]] and consumers read them independently.' },
    { id:'etl3-t5', term:'Late-arriving data', def:'Events that reach the pipeline [[after]] the time window they belong to has [[already been processed]].' }
  ],
  code:[
    { id:'etl3-c1', task:'Run a GitHub Actions workflow every day at 06:00 UTC.', lang:'yaml', code:'on:\n  [[schedule]]:\n    - cron: "[[0 6 * * *]]"   # every day at 06:00 UTC\n  workflow_dispatch:          # allow manual runs' },
    { id:'etl3-c2', task:'Read events from a Kafka topic continuously (kafka-python).', lang:'python', code:'from kafka import KafkaConsumer\n\nconsumer = [[KafkaConsumer]]("plays", bootstrap_servers="localhost:9092")\nfor message in [[consumer]]:\n    handle(message.value)' },
    { id:'etl3-c3', task:'A batch aggregation with pandas: total streams per day.', lang:'python', code:'import pandas as pd\n\ndf = pd.[[read_csv]]("chart_entries.csv")\ndaily = df.[[groupby]]("chart_date")["streams"].[[sum]]()' }
  ],
  problems:[
    { id:'etl3-p1', kind:'open', title:'Release day for "Bygone"',
      scenario:'Two requests from the label: (A) a dashboard of <b>live play counts</b> for the first hour after "Bygone" drops, to decide when to push ads; (B) a <b>weekly report</b> of chart positions for the A&R team. For each, choose batch, micro-batch or streaming, and justify it in one or two sentences.',
      hint:'Ask: how fresh, how often, and what decision depends on it?',
      solution:'(A) Streaming, or micro-batch every 1–5 minutes. The decision (when to push ads) happens within the hour, so data a day old is useless. Play events flow through a broker like Kafka into a live counter or dashboard.\n\n(B) Batch. A weekly scheduled job (cron) that reads the stored daily chart tables. Nobody acts on it faster than weekly, and batch is cheaper, simpler to test and easy to backfill.',
      explain:'Interviewers want you to <b>start from the business need</b> (the decision and the freshness it requires), then choose the simplest architecture. Saying "streaming isn\'t needed here" is a senior-sounding answer.' }
  ]
},

{ id:'etl4', title:'Data quality & testing',
  theory:{
    why:'A pipeline that runs "successfully" but loads wrong data is worse than one that crashes, because people make decisions with it. Trust in data takes months to build and one bad dashboard to lose. So data engineers <b>check data automatically at the boundaries</b> and <b>fail loudly</b> before bad data reaches users.',
    body:[
      'Common <b>data-quality checks</b>: <b>not null</b> (titles exist), <b>unique</b> (one row per chart_date + song), <b>accepted values or ranges</b> (position between 1 and 100), <b>referential integrity</b> (every song_id exists in songs), <b>volume</b> (about 100 rows per day, not 3), and <b>freshness</b> (today\'s data has arrived).',
      '<b>Schema drift</b>: the source changes shape, for example Deezer renames a field. Validate the fields you depend on during extract and transform, so the job fails with a clear message instead of loading NULLs.',
      '<b>Unit tests</b> (pytest) check one function with known input and expected output, such as "transform drops duplicate tracks". They run in CI on every push. Your project has <code>tests/test_transform.py</code>.',
      'Where checks run: in Python before load (your transform refuses duplicates or missing titles), as SQL queries that should return zero rows, or as dbt tests (<code>unique</code>, <code>not_null</code>) after load.'
    ],
    pro:'"I treat data-quality checks as assertions: a SQL check that should return zero rows, or a Python assert in the transform. If one fails, the run fails before the bad data is published."',
    q:{ q:'Your job loaded 3 rows today instead of ~100, and all values look valid. Which check would catch it?', a:'A volume (row-count) check, for example "fail if today\'s count is under 90". Not-null and unique checks pass on 3 perfectly valid rows. Volume and freshness checks catch silent partial loads.' }
  },
  terms:[
    { id:'etl4-t1', term:'Data-quality check', def:'An automated [[assertion]] about data, such as no NULLs or unique keys, that [[stops or flags]] the pipeline when it fails.' },
    { id:'etl4-t2', term:'Freshness check', def:'Verifies how [[recent]] the latest data is, e.g. today\'s chart has [[arrived]] by 07:00.' },
    { id:'etl4-t3', term:'Schema drift', def:'When the source\'s [[structure changes]] unexpectedly, such as a renamed or [[missing field]].' },
    { id:'etl4-t4', term:'Unit test', def:'A small automated test that checks [[one function]] in isolation with known input and [[expected output]].' },
    { id:'etl4-t5', term:'Volume check', def:'Compares the [[number of rows]] loaded with what is [[expected]], catching partial or empty loads.' }
  ],
  code:[
    { id:'etl4-c1', task:'Uniqueness check: should return zero rows.', lang:'sql', code:'SELECT chart_date, song_id, [[COUNT(*)]] AS n\nFROM chart_entries\nGROUP BY chart_date, song_id\n[[HAVING]] COUNT(*) > 1;' },
    { id:'etl4-c2', task:'Fail the run in Python if the data breaks the rules.', lang:'python', code:'def check(rows):\n    ids = [r["track_id"] for r in rows]\n    [[assert]] len(ids) == len([[set]](ids)), "duplicate tracks"\n    assert all(r["title"] for r in rows), "missing title"' },
    { id:'etl4-c3', task:'A pytest unit test for a dedupe function.', lang:'python', code:'def [[test_]]drops_duplicates():\n    rows = [{"track_id": 1}, {"track_id": 1}]\n    assert len(dedupe(rows)) [[==]] 1' },
    { id:'etl4-c4', task:'Referential integrity: chart rows whose song is missing (should be zero).', lang:'sql', code:'SELECT c.*\nFROM chart_entries c\n[[LEFT JOIN]] songs s ON s.song_id = c.song_id\nWHERE s.song_id [[IS NULL]];' }
  ],
  problems:[
    { id:'etl4-p1', kind:'sql', title:'Daily health check',
      scenario:'Write one query that returns every chart_date that fails a rule: it does <b>not</b> have exactly 10 entries, <b>or</b> it has any NULL streams. Return chart_date, n (row count) and null_streams.',
      hint:'GROUP BY chart_date. COUNT(*) − COUNT(streams) gives the number of NULLs. Use HAVING with OR.',
      solution:'SELECT chart_date,\n       COUNT(*) AS n,\n       COUNT(*) - COUNT(streams) AS null_streams\nFROM chart_entries\nGROUP BY chart_date\nHAVING COUNT(*) <> 10\n    OR COUNT(*) - COUNT(streams) > 0;',
      explain:'Write checks as queries that <b>return rows only when something is wrong</b>. Zero rows means healthy. That makes them easy to automate: the pipeline fails if the result is non-empty, which is how dbt tests work. 2026-10-16 is flagged here for its NULL.' }
  ]
},

{ id:'etl5', title:'Explaining your pipeline (portfolio)',
  theory:{
    why:'For a remote entry-level role, your portfolio project <b>is</b> your experience. Interviewers don\'t just check that it runs. They check that you can explain the <b>decisions</b>: why this design, what breaks, how you\'d scale it. This lesson turns your Naija Chart Pipeline into a story you can tell fluently.',
    body:[
      '<b>Architecture in one breath</b>: GitHub Actions (cron, daily) → <code>extract.py</code> calls the Deezer API → raw JSON saved per date → <code>transform.py</code> flattens and validates → <code>load.py</code> delete-and-inserts the date into DuckDB → SQL views (chart_movement with LAG, artist_summary).',
      'A <b>partition</b> is a slice of a table by a column such as date. Your load replaces exactly one date partition, which makes it idempotent and cheap.',
      '<b>Data lineage</b>: you can trace each number back through raw JSON → clean rows → table → view. <b>Logging</b> row counts each run (your load prints them) is the first step toward <b>observability</b>.',
      '<b>Scaling story</b>: DuckDB → BigQuery free tier; SQL views → dbt models with tests; GitHub Actions → Airflow when there are many dependent tasks (Module 5); add alerting when a check fails.'
    ],
    pro:'"I built a daily batch pipeline: GitHub Actions triggers a Python extractor against the Deezer API. Raw JSON lands per date for replayability, the transform enforces quality rules, and an idempotent partition load writes to DuckDB, where SQL window functions model chart movement."',
    q:{ q:'An interviewer asks, "What would break first if the chart had 10 million rows a day?" What\'s a good direction?', a:'The single-machine parts. Loading everything into Python lists in memory and one DuckDB file. Move to chunked or streamed processing, columnar files (Parquet) in object storage, a cloud warehouse with partitioned tables, and incremental models. Mentioning a measurement first ("I\'d profile where time goes") also scores well.' }
  },
  terms:[
    { id:'etl5-t1', term:'Partition', def:'A subset of a table split by a column such as [[date]], so jobs can [[overwrite or scan]] only the part they need.' },
    { id:'etl5-t2', term:'Data lineage', def:'A record of [[where data came from]] and which [[transformations]] it passed through.' },
    { id:'etl5-t3', term:'Data SLA', def:'A commitment about data [[availability]] or freshness, such as the chart table being updated [[by a set time]] each day.' },
    { id:'etl5-t4', term:'Logging', def:'Recording what a pipeline did, such as [[row counts]] and errors, so failures can be [[diagnosed]] later.' }
  ],
  code:[
    { id:'etl5-c1', task:'Connect to DuckDB and log the row count after load.', lang:'python', code:'import duckdb\n\ncon = duckdb.[[connect]]("data/charts.duckdb")\nn = con.execute("SELECT count(*) FROM chart_entries").[[fetchone]]()[0]\nprint(f"load: table now has {n} rows")' },
    { id:'etl5-c2', task:'GitHub Actions job steps that run the pipeline.', lang:'yaml', code:'steps:\n  - uses: actions/[[checkout]]@v4\n  - uses: actions/setup-python@v5\n    with:\n      python-version: "3.12"\n  - run: pip install -r requirements.txt\n  - run: [[python run_pipeline.py]]' },
    { id:'etl5-c3', task:'Create the chart_movement view (places gained since the previous day).', lang:'sql', show:'SELECT * FROM chart_movement WHERE chart_date = \'2026-10-17\' ORDER BY position;',
      code:'CREATE [[VIEW]] chart_movement AS\nSELECT chart_date, song_id, position,\n  LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date)\n    - position AS [[places_gained]]\nFROM chart_entries;' }
  ],
  problems:[
    { id:'etl5-p1', kind:'open', title:'"Walk me through your project"',
      scenario:'Answer out loud first, then type it: "Walk me through a data pipeline you built." Aim for 60–90 seconds. Cover the problem, the architecture, one design decision and one thing you\'d improve.',
      hint:'Problem → Architecture → Decision (idempotency or raw layer) → Result → Next step.',
      solution:'Problem: Deezer only shows today\'s Top Nigeria chart, so there\'s no history to see which songs are climbing.\n\nArchitecture: a daily GitHub Actions cron runs a Python pipeline. extract.py calls the Deezer API with pagination and saves the raw JSON per date. transform.py flattens the tracks and enforces quality rules (no duplicate tracks, no missing titles). load.py writes to DuckDB.\n\nDecision: I made the load idempotent by deleting and re-inserting the run date\'s partition, so retries and backfills can\'t double-count. I keep the raw JSON so I can replay history if the logic changes.\n\nResult: SQL views use LAG to compute daily movement and rank artists. For example, FOLA had 9 songs on one day\'s chart. Unit tests run with pytest.\n\nNext: move to BigQuery and dbt with not_null and unique tests, and add alerting when a check fails.',
      explain:'This <b>Problem → Architecture → Decision → Result → Next</b> structure works for any project question. Use the terms you\'ve drilled: idempotent, partition, raw layer, data quality, window function. Saying them fluently is what makes you sound intermediate.' }
  ]
}
];

/* ===== MASTER PROJECT 1: Naija Chart Pipeline =====
   Teaches the learner's own repo (github.com/orimogunjetolu/naija-chart-pipeline).
   Code items with `src` are copied verbatim from that file (validate.js checks every line).
   SQL runs on PROJECT_SQL: same columns as the real DuckDB chart_entries table
   (SQLite types), 3 days x top 8. Tracks are real; positions are illustrative. */
const PROJECT_SQL = `
CREATE TABLE chart_entries (
    chart_date   TEXT,     -- DATE in DuckDB
    position     INTEGER,
    track_id     INTEGER,  -- BIGINT in DuckDB
    title        TEXT,
    artist       TEXT,
    album        TEXT,
    duration_sec INTEGER,
    deezer_rank  INTEGER,
    explicit     INTEGER,  -- BOOLEAN in DuckDB (0/1 here)
    PRIMARY KEY (chart_date, track_id)
);
CREATE TABLE tracks_tmp (track_id INTEGER, title TEXT, artist TEXT, album TEXT, duration_sec INTEGER, deezer_rank INTEGER, explicit INTEGER);
INSERT INTO tracks_tmp VALUES
 (4209009742,'Heaven Baby','Ayra Starr','Starrgirl',159,914621,0),
 (542389502,'God is a woman','Ariana Grande','Sweetener',197,827371,1),
 (1869853847,'Dicey','Dice Ailes','Dicey',182,68909,0),
 (4127326321,'SLICK','Victony','SLICK',106,873724,1),
 (4275874582,'waf','FOLA','9',161,427308,0),
 (2578028182,'Honey B','X Kappe','Honey B',191,211861,0),
 (3639739822,'Freddy Kooger','LAZER DIM 700','The Formula',103,132155,1),
 (2816368222,'Goodbye (Warm Up)','Ayra Starr','The Year I Turned 21',163,431923,1),
 (4257488141,'Owo Oluwa','Kizz Daniel','Owo Oluwa (feat. Young Jonn, Krizbeatz & Wave Choir)',177,540452,0),
 (3812185122,'DON''T LOVE ME','Omah Lay','DON''T LOVE ME',181,253109,0);
CREATE TABLE pos_tmp (chart_date TEXT, position INTEGER, track_id INTEGER);
INSERT INTO pos_tmp VALUES
 ('2026-10-16',1,4127326321),('2026-10-16',2,4209009742),('2026-10-16',3,4257488141),('2026-10-16',4,4275874582),
 ('2026-10-16',5,3639739822),('2026-10-16',6,3812185122),('2026-10-16',7,542389502),('2026-10-16',8,2578028182),
 ('2026-10-17',1,4209009742),('2026-10-17',2,4127326321),('2026-10-17',3,4275874582),('2026-10-17',4,542389502),
 ('2026-10-17',5,4257488141),('2026-10-17',6,2816368222),('2026-10-17',7,2578028182),('2026-10-17',8,3812185122),
 ('2026-10-18',1,4209009742),('2026-10-18',2,542389502),('2026-10-18',3,1869853847),('2026-10-18',4,4127326321),
 ('2026-10-18',5,3639739822),('2026-10-18',6,4257488141),('2026-10-18',7,2816368222),('2026-10-18',8,4275874582);
INSERT INTO chart_entries
SELECT p.chart_date, p.position, t.track_id, t.title, t.artist, t.album, t.duration_sec, t.deezer_rank, t.explicit
FROM pos_tmp p JOIN tracks_tmp t ON t.track_id = p.track_id;
DROP TABLE pos_tmp; DROP TABLE tracks_tmp;
CREATE VIEW chart_movement AS
SELECT
    chart_date,
    position,
    title,
    artist,
    LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) AS prev_position,
    LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) - position AS places_gained
FROM chart_entries;
CREATE VIEW artist_summary AS
SELECT
    artist,
    COUNT(DISTINCT track_id)  AS songs_charted,
    MIN(position)             AS best_position,
    COUNT(DISTINCT chart_date) AS days_on_chart
FROM chart_entries
GROUP BY artist
ORDER BY songs_charted DESC, best_position;
`;
const PROJECT_SCHEMA = [
  ['chart_entries', 'chart_date, position, track_id, title, artist, album, duration_sec, deezer_rank, explicit. PK (chart_date, track_id). 24 rows: top 8 for 2026-10-16/17/18 (real tracks, illustrative positions)'],
  ['chart_movement', 'view from sql/01_chart_movement.sql: chart_date, position, title, artist, prev_position, places_gained'],
  ['artist_summary', 'view from sql/02_artist_summary.sql: artist, songs_charted, best_position, days_on_chart']
];

const PROJECT_LESSONS_A = [
{ id:'pj1', title:'Big picture & architecture',
  theory:{
    why:'Deezer\'s "Top Nigeria" playlist only ever shows <b>today\'s</b> chart. Yesterday\'s positions are gone the moment it updates. To answer "which songs are climbing?" you have to take a <b>snapshot every day</b>, keep it, clean it, store it somewhere you can query, and model the changes. That is the whole job of a batch pipeline, and your repo does it with one file per responsibility.',
    body:[
      '<b>The flow</b>: GitHub Actions (<code>cron: "17 7 * * *"</code>) runs <code>run_pipeline.py</code> → <code>extract()</code> saves <code>data/raw/top_nigeria_&lt;date&gt;.json</code> → <code>clean_rows()</code> returns a list of dicts → <code>load()</code> writes table <code>chart_entries</code> in <code>data/charts.duckdb</code> → <code>build_models()</code> runs <code>sql/*.sql</code> to create the views <code>chart_movement</code> and <code>artist_summary</code> → the workflow commits <code>data/</code> back to the repo.',
      '<b>Contracts between stages</b>: <code>extract()</code> returns a <code>Path</code> (the raw file), <code>clean_rows(raw_file)</code> returns <code>list[dict]</code>, and <code>load(rows)</code> returns the table\'s row count as an <code>int</code>. Each stage can be run and tested on its own.',
      '<b>Grain</b> (from the transform docstring): "Each row = one song\'s position on one day\'s chart". The database enforces it with <code>PRIMARY KEY (chart_date, track_id)</code>.',
      'Precision matters in interviews. The README diagram labels the load "idempotent upsert", but the code actually does <b>delete-then-insert</b> for the run date. Both are idempotent, so name the mechanism your code uses.',
      '<code>requirements.txt</code> lists <code>duckdb</code>, <code>requests</code> and <code>pytest</code> with <b>no pinned versions</b>. That\'s fine for a portfolio, but a future release could change behaviour. Pinning is an easy improvement to mention.'
    ],
    pro:'"It\'s a daily batch ETL: a GitHub Actions cron runs run_pipeline.py, which extracts the Deezer chart to a raw JSON layer, transforms and validates it in Python, loads it idempotently into DuckDB at a grain of one track per chart day, and builds SQL views for movement and artist dominance."',
    q:{ q:'Why does extract() return a Path instead of returning the tracks directly?', a:'Because the raw file on disk is the hand-off point. Transform reads from the file, so you can re-run transform and load from any saved raw file without calling the API again. That\'s the replayability the raw layer exists for.' }
  },
  terms:[
    { id:'pj1-t1', term:'Batch pipeline', def:'A job that processes a [[bounded]] chunk of data on a [[schedule]]; here, one chart snapshot per day.' },
    { id:'pj1-t2', term:'Snapshot', def:'A [[point-in-time]] copy of a source that keeps changing, saved so you can build [[history]].' },
    { id:'pj1-t3', term:'Separation of concerns', def:'Splitting the pipeline so each file has [[one responsibility]] (extract, transform, load, models) and can be [[tested on its own]].' },
    { id:'pj1-t4', term:'Grain of chart_entries', def:'[[One row]] is one song\'s position on [[one day\'s chart]], identified by (chart_date, track_id).' }
  ],
  code:[
    { id:'pj1-c1', src:'run_pipeline.py', task:'run_pipeline.py: import the three stages.', lang:'python',
      code:`from pipeline.extract import [[extract]]
from pipeline.load import [[DB_PATH]], load
from pipeline.transform import [[clean_rows]]` },
    { id:'pj1-c2', src:'pipeline/extract.py|pipeline/load.py', task:'Where the raw layer and the warehouse live (extract.py and load.py constants).', lang:'python',
      code:`RAW_DIR = Path("[[data/raw]]")
DB_PATH = "data/[[charts.duckdb]]"` },
    { id:'pj1-c3', src:'README.md', task:'README: run the project locally (after creating the venv).', lang:'bash',
      code:`pip install -r [[requirements.txt]]
pytest [[-q]]
python [[run_pipeline.py]]` }
  ],
  qa:[
    { id:'pj1-q1', q:'What breaks if the Deezer API is down at 07:17 UTC?', a:'raise_for_status() raises, run_pipeline.py stops and the GitHub Actions job [[fails]] before anything is loaded. Nothing is committed, so that day is [[missing]] unless you re-run it with workflow_dispatch [[before the chart updates]], because the API only serves today\'s chart.' },
    { id:'pj1-q2', q:'Why is the raw JSON saved before any cleaning happens?', a:'So the [[untouched source data]] survives even if transform has a bug; you can fix the code and [[replay]] from the raw file instead of losing that day.' }
  ],
  problems:[
    { id:'pj1-p1', kind:'open', title:'Draw it from memory',
      scenario:'Without looking, list the pipeline\'s stages <b>in order</b>. For each one, name the file and function and what it hands to the next stage. Include the scheduler and the final commit.',
      hint:'Six stages: trigger, extract, transform, load, models, commit.',
      solution:`1. Trigger: .github/workflows/daily.yml, cron "17 7 * * *" (07:17 UTC) or workflow_dispatch; runs pytest -q, then python run_pipeline.py
2. Extract: pipeline/extract.py extract() -> follows Deezer pagination, saves data/raw/top_nigeria_<date>.json, returns the Path
3. Transform: pipeline/transform.py clean_rows(raw_file) -> list of flat dicts (9 keys), positions via enumerate(start=1), 3 asserts
4. Load: pipeline/load.py load(rows) -> CREATE TABLE IF NOT EXISTS, DELETE that chart_date, executemany INSERT into data/charts.duckdb; returns total row count
5. Models: run_pipeline.py build_models() -> runs sql/01_chart_movement.sql then sql/02_artist_summary.sql (views)
6. Commit: workflow step "Commit new data" -> git add data/, commit only if something changed, git push`,
      explain:'If you can rebuild this list from memory, you can draw the architecture on a whiteboard in an interview. Practise saying it in under 60 seconds.' }
  ]
},

{ id:'pj2', title:'extract.py: pagination & the raw layer',
  theory:{
    why:'APIs return big lists in <b>pages</b> to protect their servers, and this source is <b>volatile</b>: today\'s chart replaces yesterday\'s. So extract has three jobs. It must collect <i>every</i> page, fail loudly on HTTP errors instead of saving an error page as "data", and save an <b>untouched copy</b> before any interpretation happens.',
    body:[
      'Constants: <code>CHART_PLAYLIST_ID = 1362516565</code> (Deezer Charts "Top Nigeria"), <code>URL = f"https://api.deezer.com/playlist/{CHART_PLAYLIST_ID}/tracks"</code>, <code>RAW_DIR = Path("data/raw")</code>.',
      '<b>Pagination loop</b>: start with <code>tracks, url = [], URL + "?limit=100"</code>. While <code>url</code> is truthy: GET with <code>timeout=30</code>, <code>raise_for_status()</code>, parse <code>body = resp.json()</code>, <code>tracks.extend(body.get("data", []))</code>, then <code>url = body.get("next")</code>. On the last page there is no <code>"next"</code>, so <code>.get</code> returns <code>None</code> and the loop ends.',
      '<b>timeout=30</b>: requests has no default timeout, so a hung connection could block the job until GitHub cancels it (the default job limit is 6 hours).',
      '<b>Raw layer</b>: <code>RAW_DIR.mkdir(parents=True, exist_ok=True)</code>, a file name stamped with <code>run_date.isoformat()</code>, and a payload of <code>{"chart_date": ..., "tracks": tracks}</code>. Putting the date <i>inside</i> the file means transform never has to parse it from the file name. Re-running on the same day overwrites the same file, so the raw layer is idempotent too.',
      '<b>run_date: date | None = None</b> defaults to <code>date.today()</code>. Careful: the date only <b>labels</b> the file. The API always returns the <i>current</i> chart, so passing an old date does <b>not</b> fetch history.'
    ],
    pro:'"Extract follows the API\'s next-page links until there are none, uses a 30-second timeout and raise_for_status so failures are loud, and lands the untouched response as date-stamped raw JSON, which makes the downstream steps replayable."',
    q:{ q:'Why body.get("next") instead of body["next"]?', a:'The last page has no "next" key. .get returns None, which ends the while loop cleanly, but body["next"] would raise KeyError on the final page and crash every run.' }
  },
  terms:[
    { id:'pj2-t1', term:'Pagination', def:'When an API splits results into [[pages]] and returns a link to the [[next]] page, so the client loops until there is none.' },
    { id:'pj2-t2', term:'raise_for_status()', def:'A requests method that [[raises an exception]] when the HTTP status is an [[error]] (4xx or 5xx), so a failed call is never treated as data.' },
    { id:'pj2-t3', term:'Request timeout', def:'A limit on how long to [[wait]] for the server; without one a hung connection can [[block the job]] indefinitely.' },
    { id:'pj2-t4', term:'Raw layer (data/raw/)', def:'Untouched API responses saved [[per run date]] so later steps can be [[re-run]] without calling the API again.' }
  ],
  code:[
    { id:'pj2-c1', src:'pipeline/extract.py', task:'The API URL and raw folder constants.', lang:'python',
      code:`URL = f"https://api.deezer.com/playlist/{CHART_PLAYLIST_ID}/[[tracks]]"
RAW_DIR = [[Path]]("data/raw")` },
    { id:'pj2-c2', src:'pipeline/extract.py', task:'Follow the pages until the API stops returning a "next" link.', lang:'python',
      code:`tracks, url = [], URL + "?limit=100"
while [[url]]:  # the API returns pages; follow "next" until done
    resp = requests.get(url, [[timeout=30]])
    resp.[[raise_for_status]]()
    body = resp.json()
    tracks.[[extend]](body.get("data", []))
    url = body.get("[[next]]")` },
    { id:'pj2-c3', src:'pipeline/extract.py', task:'Save the raw payload, stamped with the run date.', lang:'python',
      code:`RAW_DIR.mkdir(parents=True, [[exist_ok=True]])
out = RAW_DIR / f"top_nigeria_{run_date.[[isoformat]]()}.json"
out.[[write_text]](json.dumps({"chart_date": run_date.isoformat(), "tracks": tracks}))` },
    { id:'pj2-c4', src:'pipeline/extract.py', task:'The function signature and the default date.', lang:'python',
      code:`def extract(run_date: date | None = None) -> [[Path]]:
    run_date = run_date [[or]] date.[[today]]()` }
  ],
  qa:[
    { id:'pj2-q1', q:'What breaks if you remove the line url = body.get("next")?', a:'url never changes, so while url: loops [[forever]], requesting the [[same first page]] again and again and piling duplicates into tracks until GitHub [[cancels the job]].' },
    { id:'pj2-q2', q:'What breaks if tracks.extend(...) becomes tracks = body.get("data", [])?', a:'Each page [[overwrites]] the previous one, so only the [[last page]] is kept. It looks fine while the chart fits in one page of 100, then silently [[loses data]] once it spans more.' },
    { id:'pj2-q3', q:'What happens if you call extract(date(2026, 10, 1)) to backfill?', a:'It still downloads [[today\'s chart]] (the API has no history) and saves it [[mislabelled]] as 2026-10-01. Real backfills must come from [[saved raw files]].' }
  ],
  problems:[
    { id:'pj2-p1', kind:'open', title:'Retry on HTTP 429',
      scenario:'Deezer sometimes answers <b>429 Too Many Requests</b>. Change extract so it retries a request up to 3 times with an increasing pause, but still fails loudly on other errors. Write the helper and show where it goes in the loop.',
      hint:'Check resp.status_code. Sleep longer each attempt (back-off). Keep raise_for_status for everything else.',
      solution:`import time

def get_with_retry(url, attempts=3, wait=5):
    for i in range(attempts):
        resp = requests.get(url, timeout=30)
        if resp.status_code != 429:
            resp.raise_for_status()
            return resp.json()
        time.sleep(wait * (i + 1))   # back off: 5s, 10s, 15s
    resp.raise_for_status()          # still 429 after 3 tries -> fail loudly

# in extract(), replace the three request lines with:
#     body = get_with_retry(url)`,
      explain:'Only retry errors that are <b>transient</b> (429, and often 502/503). A 404 won\'t fix itself. <b>Back-off</b> stops you hammering a struggling server. The final <code>raise_for_status()</code> keeps the fail-loudly principle. Airflow and similar tools give you task-level retries like this for free.' }
  ]
},

{ id:'pj3', title:'transform.py: flattening & quality gates',
  theory:{
    why:'The raw JSON is nested and shaped for Deezer\'s app: <code>artist</code> and <code>album</code> are objects, and fields can be missing or null. A SQL table needs <b>flat rows with fixed columns and types</b>. Loading bad data is worse than loading nothing, so transform is also the <b>gatekeeper</b>.',
    body:[
      '<code>payload = json.loads(Path(raw_file).read_text())</code>, then <code>chart_date = payload["chart_date"]</code>. The date comes from inside the file, as extract wrote it.',
      '<b>Positions</b>: <code>for position, t in enumerate(payload["tracks"], start=1)</code>. The playlist order <i>is</i> the chart, so the first track is position 1.',
      '<b>Flattening</b>: each track becomes a dict with 9 keys in a fixed order: chart_date, position, track_id, title, artist, album, duration_sec, deezer_rank, explicit. Nested values are reached with <code>t.get("artist", {}).get("name")</code>.',
      '<b>Defensive defaults</b>: <code>(t.get("title") or "").strip()</code> turns a missing or <code>None</code> title into "" so <code>.strip()</code> never crashes. <code>int(t.get("duration") or 0)</code> and <code>bool(t.get("explicit_lyrics"))</code> coerce types. <code>deezer_rank</code> is Deezer\'s popularity score, <b>not</b> the chart position.',
      '<b>Quality gates</b>: <code>assert rows</code> (something was extracted), unique <code>track_id</code>s, and every row has a title and an artist. A failed assert raises <code>AssertionError</code>, the run stops and nothing is loaded. Caveat: Python <b>skips asserts</b> under <code>python -O</code>, so production code often uses <code>if …: raise ValueError(…)</code>.',
      '<b>Key order matters</b>: load.py inserts <code>tuple(r.values())</code> by position, so the dict\'s key order must match the table\'s column order.'
    ],
    pro:'"Transform flattens each nested track into a fixed nine-column row, derives the position from playlist order with enumerate(start=1), coerces types defensively, and enforces three quality gates (non-empty, unique track_id, title and artist present) before anything reaches the warehouse."',
    q:{ q:'t.get("artist", {}) has a default. Why can it still crash?', a:'The default {} is only used when the "artist" key is missing. If Deezer sends "artist": null, .get returns None and None.get("name") raises AttributeError. (t.get("artist") or {}) handles both cases.' }
  },
  terms:[
    { id:'pj3-t1', term:'Flattening', def:'Turning [[nested]] JSON objects into [[flat rows]] with one value per column.' },
    { id:'pj3-t2', term:'enumerate(start=1)', def:'A Python built-in that yields [[index and item]] pairs; start=1 makes the first chart position [[1]] instead of 0.' },
    { id:'pj3-t3', term:'Data-quality gate (assert)', def:'A check that raises [[AssertionError]] when a rule is broken, stopping the run [[before bad data is loaded]].' },
    { id:'pj3-t4', term:'Defensive default', def:'A pattern like or "" or .get() with a default so [[missing or null]] fields don\'t [[crash]] the transform.' }
  ],
  code:[
    { id:'pj3-c1', src:'pipeline/transform.py', task:'Read the raw file and start the loop over tracks.', lang:'python',
      code:`payload = json.loads(Path(raw_file).[[read_text]]())
chart_date = payload["[[chart_date]]"]
rows = []
for position, t in [[enumerate]](payload["tracks"], [[start=1]]):` },
    { id:'pj3-c2', src:'pipeline/transform.py', task:'Flatten the id, title and nested artist name.', lang:'python',
      code:`"track_id": t["[[id]]"],
"title": (t.get("title") [[or ""]]).[[strip]](),
"artist": (t.get("artist", {}).get("[[name]]") or "").strip(),` },
    { id:'pj3-c3', src:'pipeline/transform.py', task:'Coerce duration, rank and explicit to the right types.', lang:'python',
      code:`"duration_sec": [[int]](t.get("duration") or 0),
"deezer_rank": int(t.get("[[rank]]") or 0),
"explicit": [[bool]](t.get("explicit_lyrics")),` },
    { id:'pj3-c4', src:'pipeline/transform.py', task:'The three data-quality gates.', lang:'python',
      code:`assert [[rows]], "no rows extracted"
assert len({r["track_id"] for r in rows}) == [[len(rows)]], "duplicate tracks"
assert [[all]](r["title"] and r["artist"] for r in rows), "missing title/artist"` }
  ],
  qa:[
    { id:'pj3-q1', q:'What breaks if you remove the duplicate-tracks assert and Deezer sends a track twice?', a:'The duplicate reaches load.py after the DELETE has run. The [[primary key]] then rejects it with a [[ConstraintException]] partway through executemany, so that day is left [[incomplete]] in the warehouse. The assert fails earlier, before anything is touched.' },
    { id:'pj3-q2', q:'What breaks if Deezer sends "artist": null for one track?', a:'t.get("artist", {}) returns [[None]] because the key exists, so .get("name") raises [[AttributeError]] and the run fails. Fix: [[(t.get("artist") or {})]].get("name").' },
    { id:'pj3-q3', q:'What breaks if you drop start=1 from enumerate?', a:'Positions become [[0-based]], so the #1 song is stored as position 0. best_position shows 0, filters like position = 1 pick the [[second]] song, and test_positions_follow_order [[fails]].' }
  ],
  problems:[
    { id:'pj3-p1', kind:'open', title:'bool("false") is True',
      scenario:'Suppose Deezer starts sending <code>"explicit_lyrics": "false"</code> as a <b>string</b>. What does <code>bool("false")</code> return, what goes wrong in your data, and how would you fix the transform? Include a test.',
      hint:'Any non-empty string is truthy in Python.',
      solution:`bool("false") is True (any non-empty string is truthy), so every track would be stored as explicit = TRUE.

def to_bool(v):
    if isinstance(v, str):
        return v.strip().lower() in ("true", "1", "yes")
    return bool(v)

# in clean_rows:
#     "explicit": to_bool(t.get("explicit_lyrics")),

def test_string_false_is_not_explicit(tmp_path):
    t = _track(1)
    t["explicit_lyrics"] = "false"
    rows = clean_rows(_raw(tmp_path, [t]))
    assert rows[0]["explicit"] is False`,
      explain:'This is <b>schema drift</b>: the source changed a type without warning, and nothing crashed, so the data is just silently wrong. The fix is to make conversion rules explicit and to lock the behaviour in with a test that uses the existing <code>_raw</code> and <code>_track</code> helpers.' }
  ]
},

{ id:'pj4', title:'load.py: DDL, keys & idempotent loads',
  theory:{
    why:'Scheduled jobs <b>get re-run</b>: retries, manual re-runs, a second trigger. The load has to give the same result however many times it runs for a day. A table also needs a schema and a key so the <b>database itself</b> enforces the rules, even if Python has a bug. <b>DuckDB</b> is an in-process analytical database stored in a single file. It has no server, costs nothing, runs fast columnar SQL with window functions, and the file can live in the repo.',
    body:[
      '<code>DB_PATH = "data/charts.duckdb"</code>. <code>duckdb.connect(db_path)</code> creates the file if it doesn\'t exist.',
      '<b>DDL</b>: <code>CREATE TABLE IF NOT EXISTS chart_entries (…)</code> creates the table on the first run and does nothing afterwards, so it\'s safe to run every time. The types are DATE, INTEGER, BIGINT (Deezer ids exceed 32-bit), VARCHAR and BOOLEAN.',
      '<code>PRIMARY KEY (chart_date, track_id)</code> is a <b>composite key</b> that enforces the grain: the same track can appear once per day.',
      '<b>Delete-then-insert</b>: <code>chart_date = rows[0]["chart_date"]</code> (every row in one file shares the date), then <code>DELETE FROM chart_entries WHERE chart_date = ?</code>, then <code>executemany("INSERT INTO chart_entries VALUES (?,?,?,?,?,?,?,?,?)", [tuple(r.values()) for r in rows])</code>. Running it twice leaves exactly one copy of the day. Other days are untouched.',
      'The <code>?</code> placeholders are a <b>parameterized query</b>: values are sent separately, so there are no quoting bugs and no SQL injection. There are 9 placeholders for 9 columns, filled <b>by position</b>.',
      '<b>Logging</b>: it counts the whole table, prints <code>load: N rows for DATE; table now has M rows</code>, closes the connection and returns the count.',
      '⚠️ <b>Gap</b>: DELETE and INSERT are not wrapped in a transaction, and DuckDB autocommits each statement. If the INSERT fails (a bad row, a crash), the DELETE has already happened and the day is left empty or partial until the next good run. The fix is <code>BEGIN TRANSACTION</code> … <code>COMMIT</code>, with <code>ROLLBACK</code> on error.'
    ],
    pro:'"The load is idempotent by partition. It deletes the run date\'s rows and re-inserts them with a parameterized executemany, and a composite primary key on (chart_date, track_id) makes the database reject duplicates. The next improvement is wrapping both statements in one transaction so a failure can\'t leave a partial day."',
    q:{ q:'Why DELETE only WHERE chart_date = ? instead of deleting everything and reloading?', a:'Only today\'s partition is being reloaded. Earlier days exist only in the table (and the raw files), so wiping everything would destroy history. Replacing just one partition keeps the load cheap and safe.' }
  },
  terms:[
    { id:'pj4-t1', term:'DDL', def:'Data Definition Language: SQL statements such as [[CREATE TABLE]] that define [[structure]] rather than data.' },
    { id:'pj4-t2', term:'CREATE TABLE IF NOT EXISTS', def:'Creates the table only when it is [[missing]], so the statement is safe to run on [[every run]].' },
    { id:'pj4-t3', term:'Composite primary key', def:'A primary key made of [[more than one column]], here (chart_date, track_id), so a track can appear [[once per day]].' },
    { id:'pj4-t4', term:'Delete-then-insert', def:'An idempotent load that first [[removes the partition]] being loaded (the run date) and then inserts it [[fresh]].' },
    { id:'pj4-t5', term:'DuckDB', def:'An [[in-process]] analytical SQL database stored in a [[single file]], with no server to run.' },
    { id:'pj4-t6', term:'Parameterized query', def:'SQL with [[placeholders]] (?) whose values are passed separately, avoiding [[SQL injection]] and quoting bugs.' }
  ],
  code:[
    { id:'pj4-c1', src:'pipeline/load.py', task:'The start of the DDL.', lang:'sql',  run:false,
      code:`CREATE TABLE IF [[NOT EXISTS]] chart_entries (
    chart_date   [[DATE]],
    position     INTEGER,
    track_id     [[BIGINT]],` },
    { id:'pj4-c2', src:'pipeline/load.py', task:'The end of the DDL: the key that enforces the grain.', lang:'sql', run:false,
      code:`    explicit     BOOLEAN,
    [[PRIMARY KEY]] ([[chart_date, track_id]])
);` },
    { id:'pj4-c3', src:'pipeline/load.py', task:'Open the database and make sure the table exists.', lang:'python',
      code:`def load(rows: list[dict], db_path: str = DB_PATH) -> int:
    con = duckdb.[[connect]](db_path)
    con.execute([[DDL]])` },
    { id:'pj4-c4', src:'pipeline/load.py', task:'The idempotent heart of the load: delete the day, then insert it.', lang:'python',
      code:`chart_date = rows[0]["chart_date"]
con.execute("[[DELETE]] FROM chart_entries WHERE chart_date = [[?]]", [chart_date])
con.[[executemany]](
    "INSERT INTO chart_entries VALUES (?,?,?,?,?,?,?,?,?)",
    [tuple(r.[[values]]()) for r in rows],
)` },
    { id:'pj4-c5', src:'pipeline/load.py', task:'Count the rows for the log line, then close.', lang:'python',
      code:`n = con.execute("SELECT [[count(*)]] FROM chart_entries").[[fetchone]]()[0]
con.[[close]]()` }
  ],
  qa:[
    { id:'pj4-q1', q:'What happens if you remove the DELETE line and re-run the same day?', a:'The INSERT hits rows whose (chart_date, track_id) [[already exist]], so the [[primary key]] raises a ConstraintException and the job fails. Without the key it would silently insert [[duplicates]] and double every count.' },
    { id:'pj4-q2', q:'What breaks if you delete PRIMARY KEY from the DDL in load.py?', a:'For new databases, nothing stops a bug from loading [[duplicates]]. For the existing data/charts.duckdb, nothing changes at all: CREATE TABLE [[IF NOT EXISTS]] skips the existing table, so DDL edits need a [[migration]] or a rebuild from raw files.' },
    { id:'pj4-q3', q:'What breaks if transform adds an 11th key like "genre" to each row?', a:'tuple(r.values()) now has [[10 values]] for [[9 placeholders]], so executemany raises InvalidInputException. The DELETE has already run, so that day is [[emptied]]. The DDL, the placeholders and a migration must change together.' },
    { id:'pj4-q4', q:'What happens if the job crashes between the DELETE and the INSERT?', a:'DuckDB [[autocommits]] each statement, so the old rows for the day are gone and the new ones never arrive. The day stays [[empty]] until a re-run. Wrapping both in BEGIN/COMMIT makes the load [[atomic]].' }
  ],
  problems:[
    { id:'pj4-p1', kind:'sql', ordered:true, title:'Volume check after load',
      scenario:'After each load you want to confirm every chart day has the expected number of rows. Return chart_date and n (row count) for every day, oldest first.',
      hint:'GROUP BY chart_date, ORDER BY chart_date.',
      solution:`SELECT chart_date, COUNT(*) AS n
FROM chart_entries
GROUP BY chart_date
ORDER BY chart_date;`,
      explain:'Each sample day has 8 rows, and the real chart has 100. A <b>volume check</b> like this catches the partial-day failure described in this lesson, which uniqueness and NULL checks would miss. You could fail the job if any day is under 100.' },
    { id:'pj4-p2', kind:'open', title:'Make the load atomic',
      scenario:'Rewrite the DELETE + executemany part of <code>load()</code> so that either <b>both</b> happen or <b>neither</b> does.',
      hint:'DuckDB supports BEGIN TRANSACTION, COMMIT and ROLLBACK through con.execute.',
      solution:`con.execute("BEGIN TRANSACTION")
try:
    con.execute("DELETE FROM chart_entries WHERE chart_date = ?", [chart_date])
    con.executemany(
        "INSERT INTO chart_entries VALUES (?,?,?,?,?,?,?,?,?)",
        [tuple(r.values()) for r in rows],
    )
    con.execute("COMMIT")
except Exception:
    con.execute("ROLLBACK")
    raise`,
      explain:'If anything fails inside the try, ROLLBACK restores the previous rows for that day, and <code>raise</code> still fails the job loudly. I tested this against DuckDB: a duplicate key in executemany otherwise leaves the day <b>partially</b> inserted. Saying "I\'d wrap it in a transaction" is a strong answer to "what would you improve?".' }
  ]
},

{ id:'pj5', title:'SQL models: chart_movement & artist_summary',
  theory:{
    why:'Raw rows answer "what was the chart on day X?". The questions people actually ask are about <b>change</b> ("who climbed?") and <b>dominance</b> ("who owns the chart?"). Models encode those questions <b>once</b>, so every query and dashboard uses the same logic. They\'re views, so they always reflect the latest load and take up no storage.',
    body:[
      '<code>CREATE OR REPLACE VIEW</code> is DuckDB syntax that creates the view or overwrites its definition, so editing a .sql file takes effect on the next run. A view stores the <i>query</i>, not data. SQLite (the engine in this app) has no OR REPLACE, so the app runs <code>DROP VIEW IF EXISTS</code> + <code>CREATE VIEW</code> instead.',
      '<b>chart_movement</b>: <code>LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) AS prev_position</code> gives the song\'s position on its <b>previous appearance</b>. <code>… - position AS places_gained</code>: a lower number is better, so <b>positive = climbed</b>. A first appearance has no previous row, LAG returns NULL, and NULL minus anything is NULL.',
      'It partitions by <b>track_id</b>, not title, because different songs can share a title and track_id is the stable key.',
      '"Previous appearance" is not the same as "yesterday". If a song drops out and comes back (a <b>re-entry</b>), LAG compares it with its last appearance. In the sample data, Freddy Kooger is #5 on 10-16, missing on 10-17 and #5 again on 10-18, so places_gained is 0.',
      'The window is written twice. That\'s fine, and a CTE could compute it once, but it\'s a matter of style.',
      '<b>artist_summary</b>: <code>GROUP BY artist</code> with <code>COUNT(DISTINCT track_id) AS songs_charted</code>, <code>MIN(position) AS best_position</code> (the lowest number is the best) and <code>COUNT(DISTINCT chart_date) AS days_on_chart</code>. It needs DISTINCT because one artist can have several songs on the same day. It ends with <code>ORDER BY songs_charted DESC, best_position</code>.',
      'Caveats: it groups by the artist <i>name string</i>, so featured artists aren\'t credited. An ORDER BY inside a view isn\'t guaranteed once you query the view with other clauses, so put ORDER BY in the final query.'
    ],
    pro:'"chart_movement uses LAG partitioned by track_id and ordered by chart_date to get each song\'s previous position, and places_gained is prev minus current, so positive means it climbed and NULL marks a new entry. artist_summary aggregates by artist with COUNT DISTINCT for songs and days, and MIN position as the best peak."',
    q:{ q:'Why COUNT(DISTINCT chart_date) and not COUNT(*) for days_on_chart?', a:'COUNT(*) counts rows. Ayra Starr has two songs on 2026-10-17, so COUNT(*) would count that one day twice. COUNT(DISTINCT chart_date) counts days.' }
  },
  terms:[
    { id:'pj5-t1', term:'View', def:'A [[stored query]] that behaves like a table but holds [[no data]] itself; it is recomputed when queried.' },
    { id:'pj5-t2', term:'CREATE OR REPLACE VIEW', def:'DuckDB syntax that creates a view or [[overwrites]] its definition, so re-running the SQL file is [[idempotent]].' },
    { id:'pj5-t3', term:'prev_position', def:'The song\'s position on its [[previous appearance]], found with LAG over a partition by [[track_id]] ordered by chart_date.' },
    { id:'pj5-t4', term:'places_gained', def:'prev_position [[minus]] position: [[positive]] means the song climbed and NULL means a new entry.' },
    { id:'pj5-t5', term:'Re-entry', def:'A song that [[left the chart]] and came back; LAG compares it with its [[last appearance]], not with yesterday.' }
  ],
  code:[
    { id:'pj5-c1', src:'sql/01_chart_movement.sql', task:'sql/01_chart_movement.sql: the whole model.', lang:'sql',
      runSql:`DROP VIEW IF EXISTS chart_movement;
CREATE VIEW chart_movement AS
SELECT chart_date, position, title, artist,
    LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) AS prev_position,
    LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) - position AS places_gained
FROM chart_entries;`,
      show:`SELECT * FROM chart_movement WHERE chart_date = '2026-10-18' ORDER BY position;`,
      code:`CREATE OR REPLACE [[VIEW]] chart_movement AS
SELECT
    chart_date,
    position,
    title,
    artist,
    [[LAG]](position) OVER (PARTITION BY [[track_id]] ORDER BY chart_date) AS prev_position,
    LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) [[- position]] AS places_gained
FROM chart_entries;` },
    { id:'pj5-c2', src:'sql/02_artist_summary.sql', task:'sql/02_artist_summary.sql: who dominates the chart.', lang:'sql',
      runSql:`DROP VIEW IF EXISTS artist_summary;
CREATE VIEW artist_summary AS
SELECT artist,
    COUNT(DISTINCT track_id)  AS songs_charted,
    MIN(position)             AS best_position,
    COUNT(DISTINCT chart_date) AS days_on_chart
FROM chart_entries
GROUP BY artist
ORDER BY songs_charted DESC, best_position;`,
      show:'SELECT * FROM artist_summary;',
      code:`CREATE OR REPLACE VIEW artist_summary AS
SELECT
    artist,
    COUNT([[DISTINCT]] track_id)  AS songs_charted,
    [[MIN]](position)             AS best_position,
    COUNT(DISTINCT [[chart_date]]) AS days_on_chart
FROM chart_entries
[[GROUP BY]] artist
ORDER BY songs_charted [[DESC]], best_position;` },
    { id:'pj5-c3', src:'README.md', task:'README example: biggest climbers today.', lang:'sql',
      runSql:`SELECT * FROM chart_movement
WHERE chart_date = (SELECT MAX(chart_date) FROM chart_entries) ORDER BY places_gained DESC LIMIT 10;`,
      code:`SELECT * FROM [[chart_movement]]
WHERE chart_date = [[CURRENT_DATE]] ORDER BY [[places_gained]] DESC LIMIT 10;` }
  ],
  qa:[
    { id:'pj5-q1', q:'What breaks if chart_movement used PARTITION BY title instead of track_id?', a:'Two [[different songs]] with the same title would be treated as one, so LAG would compare positions of unrelated tracks and places_gained would be [[wrong]]. track_id is the stable [[unique key]].' },
    { id:'pj5-q2', q:'What breaks if you remove ORDER BY chart_date inside OVER (...)?', a:'LAG then has no defined order, so the "previous" row is [[arbitrary]] and prev_position becomes [[meaningless]]. Results can even change between runs.' },
    { id:'pj5-q3', q:'In the README query, why would a NULLs-first database put new entries at the top of ORDER BY places_gained DESC?', a:'New entries have places_gained = [[NULL]]. Databases differ on where NULLs [[sort]] (DuckDB and SQLite put them last in DESC, Postgres puts them first), so add [[NULLS LAST]] or filter them out to be explicit.' }
  ],
  problems:[
    { id:'pj5-p1', kind:'sql', ordered:true, title:'Today\'s biggest climber',
      scenario:'Using the <code>chart_movement</code> view, return the title and places_gained of the single biggest climber on the <b>latest</b> chart date in the table.',
      hint:'Latest date = (SELECT MAX(chart_date) FROM chart_entries). ORDER BY places_gained DESC LIMIT 1.',
      solution:`SELECT title, places_gained
FROM chart_movement
WHERE chart_date = (SELECT MAX(chart_date) FROM chart_entries)
ORDER BY places_gained DESC
LIMIT 1;`,
      explain:'"God is a woman" went from #4 to #2 (+2). The sample data stops at a fixed date, so the README\'s <code>CURRENT_DATE</code> would match nothing here. <code>MAX(chart_date)</code> means "the latest load", which also works when you re-run old data.' }
  ]
}
];

const PROJECT_LESSONS_B = [
{ id:'pj6', title:'tests: pytest, tmp_path & what each test protects',
  theory:{
    why:'transform.py holds your business rules: positions, quality gates. If someone (future you) edits it, you want a machine to tell you <b>instantly</b> whether the rules still hold, <b>before</b> the daily job loads anything. Tests also document intended behaviour, and your workflow runs <code>pytest -q</code> before the pipeline, so a failing test blocks the run.',
    body:[
      'pytest collects files named <code>test_*.py</code> and functions named <code>test_*</code>. Checks are plain <code>assert</code>s. <code>with pytest.raises(AssertionError):</code> passes <b>only if</b> the code inside raises that exception.',
      '<b>pytest.ini</b>: <code>[pytest]</code> / <code>pythonpath = .</code> adds the repo root to the import path, so <code>from pipeline.transform import clean_rows</code> works when you run plain <code>pytest</code>. Without it, the workflow\'s <code>pytest -q</code> fails with <code>ModuleNotFoundError: No module named \'pipeline\'</code>. (I checked: <code>python -m pytest</code> happens to work because it adds the current folder.)',
      '<b>tmp_path</b> is a <b>built-in fixture</b>. pytest sees a parameter with that name and injects a fresh, unique temporary directory as a <code>pathlib.Path</code>, so tests never touch the real <code>data/raw/</code>.',
      '<b>Helpers</b>: <code>_raw(tmp_path, tracks)</code> writes a fake raw file in exactly the shape extract produces, and <code>_track(i, title="Song")</code> builds a minimal Deezer-like track. The leading underscore and the missing <code>test_</code> prefix mean pytest doesn\'t collect them as tests.',
      '<b>What each test protects</b>: <code>test_positions_follow_order</code> protects <code>enumerate(start=1)</code>, <code>test_rejects_duplicates</code> protects the unique track_id gate, and <code>test_rejects_missing_title</code> protects the title/artist gate.',
      '<b>Gaps</b>: nothing tests load (idempotency), extract (pagination, with a mocked HTTP call) or the SQL models. A load test is easy. Load the same rows twice into a DuckDB file under tmp_path and assert the count doesn\'t change (it\'s in this lesson\'s problem).'
    ],
    pro:'"Transform is covered by pytest unit tests that build fake raw files with the tmp_path fixture: positions follow playlist order, duplicates are rejected, and missing titles are rejected. They run in CI before the pipeline, so a broken rule can\'t load data."',
    q:{ q:'Why don\'t the tests call the real Deezer API?', a:'Tests must be fast, deterministic and offline. Real chart data changes daily and the network can fail, so the tests build their own input with _raw and _track, and a failure always means the code changed.' }
  },
  terms:[
    { id:'pj6-t1', term:'pytest fixture', def:'A reusable setup value that pytest [[injects]] into a test function by its [[parameter name]].' },
    { id:'pj6-t2', term:'tmp_path', def:'A built-in pytest fixture that gives each test a [[unique temporary directory]] as a [[pathlib.Path]].' },
    { id:'pj6-t3', term:'pytest.raises', def:'A context manager that makes a test [[pass only if]] the code inside raises the [[expected exception]].' },
    { id:'pj6-t4', term:'Test isolation', def:'Each test builds its [[own input]] and does not depend on the network, real files or [[other tests]].' },
    { id:'pj6-t5', term:'pythonpath = .', def:'A pytest.ini setting that adds the [[project root]] to the import path so tests can import the [[pipeline]] package.' }
  ],
  code:[
    { id:'pj6-c1', src:'tests/test_transform.py', task:'The helper that writes a fake raw file.', lang:'python',
      code:`def _raw(tmp_path, tracks):
    f = tmp_path / "[[raw.json]]"
    f.[[write_text]](json.dumps({"chart_date": "2026-10-17", "tracks": tracks}))
    return [[f]]` },
    { id:'pj6-c2', src:'tests/test_transform.py', task:'The helper that builds a minimal Deezer track.', lang:'python',
      code:`def _track(i, title="[[Song]]"):
    return {"id": i, "title": title, "artist": {"[[name]]": "Artist"},
            "album": {"title": "Album"}, "duration": 180, "rank": 5000}` },
    { id:'pj6-c3', src:'tests/test_transform.py', task:'Test: positions follow the playlist order.', lang:'python',
      code:`def test_positions_follow_order([[tmp_path]]):
    rows = clean_rows([[_raw]](tmp_path, [_track(1), _track(2)]))
    [[assert]] [r["position"] for r in rows] == [1, 2]` },
    { id:'pj6-c4', src:'tests/test_transform.py', task:'Test: duplicate tracks are rejected.', lang:'python',
      code:`def test_rejects_duplicates(tmp_path):
    with pytest.[[raises]]([[AssertionError]]):
        clean_rows(_raw(tmp_path, [_track(1), _track(1)]))` },
    { id:'pj6-c5', src:'pytest.ini', task:'pytest.ini: make the pipeline package importable.', lang:'ini',
      code:`[pytest]
[[pythonpath]] = [[.]]` }
  ],
  qa:[
    { id:'pj6-q1', q:'What breaks if you delete test_rejects_duplicates?', a:'Nothing fails today. But if someone later removes the duplicate assert in transform.py, [[no test catches it]], and duplicates reach load.py, where the primary key [[fails the run]] mid-load.' },
    { id:'pj6-q2', q:'What breaks if you remove pythonpath = . from pytest.ini?', a:'Plain pytest can\'t import the pipeline package: [[ModuleNotFoundError]], because the repo root is [[not on the import path]]. The workflow\'s pytest -q step fails and the pipeline [[never runs]].' },
    { id:'pj6-q3', q:'Why write the fake file to tmp_path instead of data/raw/?', a:'tmp_path is [[unique per test]] and managed by pytest, so tests can\'t [[overwrite real raw files]] or interfere with each other.' }
  ],
  problems:[
    { id:'pj6-p1', kind:'open', title:'Test that load() is idempotent',
      scenario:'Write a pytest test proving that calling <code>load()</code> twice with the same rows leaves the table with the same number of rows. Use <code>tmp_path</code> so it never touches <code>data/charts.duckdb</code>.',
      hint:'load(rows, db_path=...) returns the table\'s total row count. Build rows with all 9 keys in the right order.',
      solution:`from pipeline.load import load


def _row(track_id, position):
    return {"chart_date": "2026-10-17", "position": position, "track_id": track_id,
            "title": "Song", "artist": "Artist", "album": "Album",
            "duration_sec": 180, "deezer_rank": 5000, "explicit": False}


def test_load_is_idempotent(tmp_path):
    db = str(tmp_path / "test.duckdb")
    rows = [_row(1, 1), _row(2, 2)]
    assert load(rows, db_path=db) == 2
    assert load(rows, db_path=db) == 2   # re-run: still 2, no duplicates`,
      explain:'I ran this exact test against your repo\'s code with pytest, and it passes. It turns your main design claim ("loads are idempotent") into something CI checks on every run. The dict keys must follow the column order because load inserts <code>tuple(r.values())</code> by position.' }
  ]
},

{ id:'pj7', title:'GitHub Actions: cron, permissions & the commit step',
  theory:{
    why:'A pipeline that only runs when you remember to run it isn\'t a pipeline. You need a <b>scheduler</b>, a <b>clean machine</b> each time, the tests as a <b>gate</b>, and somewhere to <b>keep the output</b>. GitHub Actions gives free runners for public repos, and committing <code>data/</code> back to the repo makes Git your storage, with full history.',
    body:[
      '<code>on: schedule: - cron: "17 7 * * *"</code> has five fields: minute, hour, day-of-month, month and day-of-week. It means 07:17 <b>UTC</b> every day. GitHub can delay scheduled runs when it\'s busy (especially on the hour), and an odd minute like :17 helps.',
      '<code>workflow_dispatch: {}</code> adds a <b>Run workflow</b> button (and API/CLI trigger) for manual runs and re-runs. Your first data commit, "data: chart for 2026-10-18" by chart-bot, came from a run shortly after the initial push.',
      '<code>permissions: contents: write</code> lets the job\'s automatic <code>GITHUB_TOKEN</code> push commits. If the default token is read-only (the default for newer repos), the final <code>git push</code> is rejected without it.',
      'Steps run <b>in order</b>, and a failing step stops the job: <code>actions/checkout@v4</code> → <code>actions/setup-python@v5</code> with Python 3.12 → <code>pip install -r requirements.txt</code> → <code>pytest -q</code> (the <b>gate</b>) → <code>python run_pipeline.py</code> → "Commit new data".',
      '<b>Commit step</b>: set a bot identity, <code>git add data/</code>, then <code>git diff --cached --quiet || git commit -m "data: chart for $(date -u +%F)"</code>. <code>diff --cached --quiet</code> exits 0 when nothing is staged, so the commit is skipped instead of failing. <code>$(date -u +%F)</code> is today\'s date as YYYY-MM-DD in UTC. Then <code>git push</code>.',
      'Trade-offs: every run commits the whole DuckDB binary (it went from about 0.8 MB to 1.3 MB in one day), so the repo grows. In public repos, GitHub disables scheduled workflows after 60 days with no repository activity.'
    ],
    pro:'"A GitHub Actions workflow runs daily at 07:17 UTC (and on demand via workflow_dispatch). It installs dependencies, runs pytest as a gate, runs the pipeline, and commits only when data changed, using a contents: write token."',
    q:{ q:'Why run pytest before run_pipeline.py in the same job?', a:'Steps run in order and a failed step stops the job. If transform\'s rules are broken, the pipeline never runs and no bad data is loaded or committed.' }
  },
  terms:[
    { id:'pj7-t1', term:'Cron expression', def:'Five fields (minute, hour, day of month, month, day of week); "17 7 * * *" means [[07:17]] [[UTC]] every day.' },
    { id:'pj7-t2', term:'workflow_dispatch', def:'A trigger that lets you run a workflow [[manually]] from the [[Actions tab]], API or CLI.' },
    { id:'pj7-t3', term:'GITHUB_TOKEN permissions', def:'The automatic token\'s rights; [[contents: write]] is needed for the job to [[push commits]] back to the repo.' },
    { id:'pj7-t4', term:'CI gate', def:'Running the [[tests before]] the pipeline so a failing test [[stops the job]] before data changes.' }
  ],
  code:[
    { id:'pj7-c1', src:'.github/workflows/daily.yml', task:'Triggers: daily schedule plus a manual button.', lang:'yaml',
      code:`on:
  [[schedule]]:
    - cron: "[[17 7 * * *]]"   # 07:17 UTC daily
  [[workflow_dispatch]]: {}` },
    { id:'pj7-c2', src:'.github/workflows/daily.yml', task:'Let the job push commits.', lang:'yaml',
      code:`permissions:
  [[contents]]: [[write]]` },
    { id:'pj7-c3', src:'.github/workflows/daily.yml', task:'The job steps up to running the pipeline.', lang:'yaml',
      code:`- uses: actions/[[checkout]]@v4
- uses: actions/setup-python@v5
  with: { python-version: "[[3.12]]" }
- run: pip install -r requirements.txt
- run: [[pytest -q]]
- run: python [[run_pipeline.py]]` },
    { id:'pj7-c4', src:'.github/workflows/daily.yml', task:'Commit the new data only if something changed.', lang:'bash',
      code:`git add [[data/]]
git diff [[--cached --quiet]] || git commit -m "data: chart for $(date -u +%F)"
git [[push]]` }
  ],
  qa:[
    { id:'pj7-q1', q:'What breaks if you remove permissions: contents: write?', a:'With a read-only default token, the pipeline still runs but the final [[git push]] is [[rejected]], the job fails, and the new data is [[lost]] when the runner is destroyed.' },
    { id:'pj7-q2', q:'What breaks if you drop "git diff --cached --quiet ||"?', a:'On a run where nothing changed, git commit exits with an [[error]] because there is [[nothing to commit]], so the job goes red even though the pipeline worked.' },
    { id:'pj7-q3', q:'What happens to the data if the pytest step fails?', a:'The later steps [[don\'t run]], so the pipeline never touches the data that day. You get no bad data, but a [[missing day]] unless you fix it and re-run before the chart updates.' }
  ],
  problems:[
    { id:'pj7-p1', kind:'open', title:'Run twice a day',
      scenario:'You want a second run at 19:17 UTC as a safety net. Change the schedule, and explain whether the data stays correct when both runs happen on the same day.',
      hint:'Cron fields accept lists like 7,19. What does load do for a date that already exists?',
      solution:`on:
  schedule:
    - cron: "17 7,19 * * *"   # 07:17 and 19:17 UTC
  workflow_dispatch: {}

Still correct: both runs use the same UTC date, so extract overwrites the same raw file and load deletes that chart_date and re-inserts it. The second run replaces the first; no duplicates. If nothing changed, the commit step skips the commit.`,
      explain:'This is idempotency paying off. Because the load replaces a partition, adding triggers or retries is safe. Mentioning that link between scheduling and idempotency is exactly what interviewers look for.' }
  ]
},

{ id:'pj8', title:'run_pipeline.py: orchestration',
  theory:{
    why:'Each stage is a function. Something has to call them <b>in the right order</b>, pass each output to the next input, and <b>stop if one fails</b>. That\'s orchestration. In your repo it\'s about 20 lines of Python. At larger scale Airflow does the same job, adding retries, dependencies, backfills and a UI.',
    body:[
      '<code>if __name__ == "__main__":</code>, then <code>raw = extract()</code>, <code>load(clean_rows(raw))</code>, <code>build_models()</code>. This block runs only when the file is executed directly (<code>python run_pipeline.py</code>), not when it\'s imported.',
      '<b>Fail-fast</b>: Python stops at the first uncaught exception. A failed assert in clean_rows means load never runs, and a failed load means the models aren\'t rebuilt.',
      '<b>build_models</b> connects to <code>DB_PATH</code> and loops over <code>sorted(Path("sql").glob("*.sql"))</code>. <code>sorted</code> makes the order deterministic, and the <code>01_</code>/<code>02_</code> prefixes decide which model builds first, which matters once one view depends on another. Each file runs with <code>con.execute(sql_file.read_text())</code> and logs <code>model: built {sql_file.stem}</code>.',
      '<b>Relative paths</b>: "sql", "data/raw" and "data/charts.duckdb" resolve from the <b>working directory</b>, so the script must start from the repo root (as GitHub Actions does after checkout).',
      'What it doesn\'t have: a way to re-load a saved raw file (a backfill option), retries, or alerting. That\'s the gap Airflow (Module 5) fills.'
    ],
    pro:'"run_pipeline.py is a small fail-fast orchestrator. It chains extract, transform and load through their return values, then builds the SQL models in a deterministic sorted order. At scale I\'d move these steps into an Airflow DAG for retries and backfills."',
    q:{ q:'Why wrap the glob in sorted()?', a:'glob returns files in filesystem order, which isn\'t guaranteed. sorted() makes 01_chart_movement.sql build before 02_artist_summary.sql on every machine.' }
  },
  terms:[
    { id:'pj8-t1', term:'Orchestration', def:'Coordinating pipeline [[steps]] so they run in the right [[order]], pass data along and stop on failure.' },
    { id:'pj8-t2', term:'Fail-fast', def:'Stopping at the [[first error]] so later steps never run on [[bad or missing]] input.' },
    { id:'pj8-t3', term:'if __name__ == "__main__"', def:'A guard so code runs only when the file is [[executed directly]], not when it is [[imported]].' },
    { id:'pj8-t4', term:'Deterministic build order', def:'Using [[sorted()]] and numeric file prefixes (01_, 02_) so models always build in the [[same order]].' }
  ],
  code:[
    { id:'pj8-c1', src:'run_pipeline.py', task:'The entry point: chain the three stages, then build the models.', lang:'python',
      code:`if __name__ == "[[__main__]]":
    raw = [[extract]]()
    [[load]](clean_rows(raw))
    build_models()` },
    { id:'pj8-c2', src:'run_pipeline.py', task:'build_models: run every SQL file in order.', lang:'python',
      code:`def build_models(db_path: str = DB_PATH) -> None:
    con = duckdb.connect(db_path)
    for sql_file in [[sorted]](Path("sql").[[glob]]("*.sql")):
        con.execute(sql_file.[[read_text]]())
        print(f"model: built {sql_file.[[stem]]}")
    con.close()` }
  ],
  qa:[
    { id:'pj8-q1', q:'What breaks if you start it from another folder, e.g. cd pipeline && python ../run_pipeline.py?', a:'Imports still work, because Python adds the script\'s folder to the path. But relative paths resolve from the [[working directory]]: data is written under pipeline/data/, and Path("sql").glob finds [[no files]], so no models are built and [[nothing errors]].' },
    { id:'pj8-q2', q:'What breaks if you remove sorted() around the glob?', a:'Files come back in [[filesystem order]], which isn\'t guaranteed. Today the two views are independent, but a model that [[depends on another view]] could fail when it builds first.' },
    { id:'pj8-q3', q:'What breaks if build_models() runs before load() on a brand-new repo?', a:'The views reference chart_entries, which [[doesn\'t exist yet]]. DuckDB raises a [[Catalog Error]] when creating the view, so the run fails.' }
  ],
  problems:[
    { id:'pj8-p1', kind:'open', title:'Add a --from-raw backfill option',
      scenario:'The API can\'t give you old charts, but your <code>data/raw/</code> folder can. Add a command-line option so <code>python run_pipeline.py --from-raw data/raw/top_nigeria_2026-10-17.json</code> re-transforms and re-loads a saved file instead of calling the API.',
      hint:'argparse. If the option is given, skip extract() and use that Path.',
      solution:`import argparse
from pathlib import Path

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--from-raw", help="re-load a saved raw file instead of calling the API")
    args = parser.parse_args()
    raw = Path(args.from_raw) if args.from_raw else extract()
    load(clean_rows(raw))
    build_models()`,
      explain:'This is a real <b>backfill</b>. It works because the raw file stores its own chart_date and the load is idempotent, so re-loading a past day just replaces that partition. Raw layer + idempotent load = safe replays: say that sentence in interviews.' }
  ]
},

{ id:'pj9', title:'Hands-on: extend the pipeline',
  theory:{
    why:'"How would you extend it?" is one of the most common interview follow-ups. Actually building small extensions proves you understand your own data model. These tasks run on a sample <code>chart_entries</code> table with the <b>same columns as your DuckDB table</b>: the top 8 for 2026-10-16, 17 and 18. The tracks are real, the positions are illustrative, and the <code>chart_movement</code> and <code>artist_summary</code> views already exist.',
    body:[
      '<b>"Today"</b> = <code>(SELECT MAX(chart_date) FROM chart_entries)</code>. <code>CURRENT_DATE</code> won\'t match sample data, and MAX also works when you re-run old loads.',
      '<b>New entry vs re-entry</b>: a new entry has <code>prev_position IS NULL</code>. A re-entry (Freddy Kooger: #5 on 10-16, absent on 10-17, back on 10-18) has a prev_position from its last appearance, so it is <i>not</i> new.',
      '<b>Dropper vs drop-out</b>: a dropper is still on today\'s chart with negative places_gained. A drop-out was on the previous chart and is <b>missing</b> today, so it never appears in today\'s rows. Finding it needs an <b>anti-join</b> against the previous date.',
      'Make results <b>deterministic</b>: when values tie, add a tie-breaker to ORDER BY (for example title).'
    ],
    pro:'"I extended the model with a new-entries view based on LAG returning NULL, a droppers report, and a drop-outs check using an anti-join against the previous chart date."',
    q:{ q:'On the very first day the pipeline ever ran, how many songs would a naive "prev_position IS NULL" view call new?', a:'All of them, because nothing has a previous row yet. That\'s why the view also filters on the latest date, and why you\'d treat the first load as a baseline rather than "100 new entries".' }
  },
  terms:[
    { id:'pj9-t1', term:'New entry', def:'A song whose [[first-ever]] appearance is today, so its prev_position is [[NULL]].' },
    { id:'pj9-t2', term:'Dropper', def:'A song still on today\'s chart whose places_gained is [[negative]], meaning it [[fell]].' },
    { id:'pj9-t3', term:'Drop-out', def:'A song on the previous chart that is [[missing]] today; finding it needs an [[anti-join]].' },
    { id:'pj9-t4', term:'Deterministic tie-break', def:'Adding a second ORDER BY column such as [[title]] so tied rows always come back in the [[same order]].' }
  ],
  code:[
    { id:'pj9-c1', task:'Find the latest chart date ("today" for this data).', lang:'sql', code:'SELECT [[MAX]](chart_date) AS today\nFROM [[chart_entries]];' },
    { id:'pj9-c2', task:'New entries on the latest date, using chart_movement.', lang:'sql',
      code:`SELECT title, artist
FROM chart_movement
WHERE [[prev_position IS NULL]]
  AND chart_date = (SELECT [[MAX]](chart_date) FROM chart_entries);` },
    { id:'pj9-c3', task:'Count #1 days per artist.', lang:'sql',
      code:`SELECT artist, [[COUNT(*)]] AS days_at_1
FROM chart_entries
WHERE position = [[1]]
GROUP BY [[artist]];` }
  ],
  qa:[],
  problems:[
    { id:'pj9-p1', kind:'sql', title:'Task 1: a view of today\'s new entries',
      after:'SELECT title, artist FROM new_entries;',
      scenario:'Create a view <code>new_entries</code> with chart_date, position, title and artist for songs appearing on the chart for the <b>first time</b> on the latest chart date. Re-entries don\'t count. (The checker runs <code>SELECT title, artist FROM new_entries</code> after your code.)',
      hint:'Build on chart_movement: prev_position IS NULL, plus chart_date = the MAX date.',
      solution:`CREATE VIEW new_entries AS
SELECT chart_date, position, title, artist
FROM chart_movement
WHERE prev_position IS NULL
  AND chart_date = (SELECT MAX(chart_date) FROM chart_entries);`,
      explain:'Only <b>Dicey</b> (Dice Ailes) is new. Freddy Kooger is a re-entry, because LAG finds his 10-16 row. Reusing chart_movement rather than repeating the LAG logic is how layered models (and dbt) work: one definition, many consumers. In DuckDB you\'d write <code>CREATE OR REPLACE VIEW</code> to match your other models.' },
    { id:'pj9-p2', kind:'sql', ordered:true, title:'Task 2: biggest droppers',
      scenario:'For the latest chart date, list songs that <b>fell</b>: title, prev_position, position and places_gained. Order by places_gained (worst first), with ties broken by title.',
      hint:'chart_movement, latest date, places_gained < 0, ORDER BY places_gained, title.',
      solution:`SELECT title, prev_position, position, places_gained
FROM chart_movement
WHERE chart_date = (SELECT MAX(chart_date) FROM chart_entries)
  AND places_gained < 0
ORDER BY places_gained, title;`,
      explain:'"waf" fell 5 places (3 → 8). "Goodbye (Warm Up)" and "Owo Oluwa" tie at −1, so the title tie-breaker makes the order deterministic. <code>places_gained < 0</code> also excludes new entries automatically, because NULL < 0 is UNKNOWN, not TRUE.' },
    { id:'pj9-p3', kind:'sql', title:'Task 3: artist with the most #1 days',
      scenario:'Which artist held position 1 on the most chart days? Return artist and days_at_1 for the top artist only.',
      hint:'WHERE position = 1, GROUP BY artist, ORDER BY the count DESC, LIMIT 1.',
      solution:`SELECT artist, COUNT(*) AS days_at_1
FROM chart_entries
WHERE position = 1
GROUP BY artist
ORDER BY days_at_1 DESC
LIMIT 1;`,
      explain:'Ayra Starr had 2 of the 3 days (Victony had 10-16). One row per (date, position) means COUNT(*) counts days here. With real data, ties are possible: <code>RANK() OVER (ORDER BY COUNT(*) DESC)</code> and then <code>WHERE rnk = 1</code> returns every tied artist instead of an arbitrary one.' },
    { id:'pj9-p4', kind:'sql', title:'Bonus: songs that dropped off the chart',
      scenario:'Return the title and artist of every song that was on the chart on the <b>previous</b> chart date but is <b>missing</b> from the latest one.',
      hint:'Previous date = MAX(chart_date) below the latest. Then NOT EXISTS a row for the same track_id on the latest date.',
      solution:`WITH d AS (
  SELECT MAX(chart_date) AS today,
         (SELECT MAX(chart_date) FROM chart_entries
          WHERE chart_date < (SELECT MAX(chart_date) FROM chart_entries)) AS prev_day
  FROM chart_entries
)
SELECT c.title, c.artist
FROM chart_entries c, d
WHERE c.chart_date = d.prev_day
  AND NOT EXISTS (
    SELECT 1 FROM chart_entries t
    WHERE t.track_id = c.track_id AND t.chart_date = d.today
  );`,
      explain:'"Honey B" and "DON\'T LOVE ME" dropped out. They\'re invisible in chart_movement for today because they have no row today. That\'s why drop-outs need an <b>anti-join</b> (NOT EXISTS or LEFT JOIN … IS NULL) against yesterday.' },
    { id:'pj9-p5', kind:'open', title:'Task 4: a positions-are-1..N quality check (Python)',
      scenario:'Add a data-quality check to <code>transform.py</code>: the positions must be exactly 1..N with no gaps and no duplicates. Call it from <code>clean_rows</code>, and write a pytest test that proves it rejects a gap.',
      hint:'sorted(positions) should equal list(range(1, len(rows) + 1)).',
      solution:`# pipeline/transform.py
def check_positions(rows: list[dict]) -> None:
    positions = sorted(r["position"] for r in rows)
    assert positions == list(range(1, len(rows) + 1)), "positions must be 1..N with no gaps"

# in clean_rows, just before "return rows":
#     check_positions(rows)

# tests/test_transform.py
from pipeline.transform import check_positions


def test_rejects_position_gap():
    with pytest.raises(AssertionError):
        check_positions([{"position": 1}, {"position": 3}])


def test_accepts_full_sequence():
    check_positions([{"position": 2}, {"position": 1}])`,
      explain:'I ran these tests against a copy of your repo and they pass. Be honest in interviews: today positions come from <code>enumerate(start=1)</code>, so they can\'t have gaps. The check guards <b>future changes</b>, such as reading a position field from the API or filtering rows. That\'s what quality checks are for: they protect the rule, not the current implementation.' },
    { id:'pj9-p6', kind:'sql', title:'Task 4b: the same check in SQL',
      setup:`INSERT INTO chart_entries (chart_date, position, track_id, title, artist, album, duration_sec, deezer_rank, explicit) VALUES
 ('2026-10-19',1,4209009742,'Heaven Baby','Ayra Starr','Starrgirl',159,914621,0),
 ('2026-10-19',2,542389502,'God is a woman','Ariana Grande','Sweetener',197,827371,1),
 ('2026-10-19',4,1869853847,'Dicey','Dice Ailes','Dicey',182,68909,0);`,
      scenario:'A broken load added 2026-10-19 with positions 1, 2, 4. Write a query that returns each chart_date whose positions are <b>not</b> exactly 1..N. Return chart_date, n (rows) and max_pos.',
      hint:'Per date, positions are 1..N exactly when MIN = 1, MAX = COUNT(*) and COUNT(DISTINCT position) = COUNT(*).',
      solution:`SELECT chart_date, COUNT(*) AS n, MAX(position) AS max_pos
FROM chart_entries
GROUP BY chart_date
HAVING MIN(position) <> 1
    OR MAX(position) <> COUNT(*)
    OR COUNT(DISTINCT position) <> COUNT(*);`,
      explain:'This returns 2026-10-19 (3 rows but max position 4). In SQL the check runs <b>after</b> load, against everything in the warehouse, which complements the Python check that runs <b>before</b> load. A dbt test is exactly this: a query that should return zero rows.' }
  ]
},

{ id:'pj10', title:'Mock interview: your project',
  theory:{
    why:'In an interview you have to explain <b>your own code</b>, fluently, under pressure. If the core answers are drilled until they come automatically, your working memory is free for the follow-up questions, which is where interviews are won. Every answer below is checked against your actual repo.',
    body:[
      '<b>Frame for any answer</b>: Point (one sentence) → Evidence from the code (file, function, line) → Trade-off → Improvement. Keep it to 30–60 seconds, then stop and let them dig.',
      '<b>Be precise</b>: say "delete-then-insert of the run date\'s partition", not "upsert", because that\'s what load.py does.',
      '<b>Own the limitations</b>: no transaction around DELETE + INSERT, asserts are skipped under -O, no backfill option, unpinned dependencies, and the DuckDB binary is committed to Git. Naming a gap <i>and</i> its fix sounds senior.',
      'Drill each question below through the fade ladder until Level 4. Then say the answers out loud while walking. Spoken fluency is a separate skill from typing.'
    ],
    pro:'"I\'d be happy to walk you through it, and I can also tell you the three things I\'d change first."',
    q:{ q:'An interviewer asks something about your project that you\'ve never thought about. What\'s the best move?', a:'Think aloud from first principles using your code. Say what the code does today, what would happen in their scenario, and how you\'d change it. Honest reasoning beats a bluff.' }
  },
  terms:[],
  code:[],
  qa:[
    { id:'pj10-q1', q:'"Walk me through your pipeline."', a:'It\'s a daily [[batch ETL]] for the Deezer Top Nigeria chart. A [[GitHub Actions cron]] runs run_pipeline.py at 07:17 UTC. extract.py follows the API\'s pagination and saves [[raw JSON]] per date, transform.py flattens the tracks and asserts quality rules, load.py does an [[idempotent]] delete-then-insert into DuckDB, and SQL views use [[LAG]] for chart movement. Tests run first, and the job commits the data back to the repo.' },
    { id:'pj10-q2', q:'"How do you handle failures and re-runs?"', a:'Every stage [[fails loudly]]: raise_for_status for HTTP errors, asserts for bad data, and pytest runs first, so a failure stops the job before data changes. Re-runs are safe because load replaces the [[run date\'s partition]], with a [[primary key]] as a backstop, and I can re-run with [[workflow_dispatch]]. One gap I\'d fix: wrapping the delete and insert in a [[transaction]].' },
    { id:'pj10-q3', q:'"What exactly makes the load idempotent?"', a:'load.py runs DELETE FROM chart_entries WHERE chart_date = ? and then inserts that day\'s rows, so running it [[twice]] leaves exactly [[one copy]] of the day. The [[composite primary key]] (chart_date, track_id) makes a duplicate raise an error instead of silently doubling counts.' },
    { id:'pj10-q4', q:'"Why DuckDB?"', a:'It\'s an [[in-process]] columnar analytical database in a [[single file]]: no server, free, and fast SQL with [[window functions]], and the file can live in the repo for GitHub Actions. For many users or much bigger data I\'d move to a [[cloud warehouse]] like BigQuery.' },
    { id:'pj10-q5', q:'"Why keep the raw JSON?"', a:'The API only serves [[today\'s chart]], so the raw files are my only copy of history. They let me [[replay]] transform and load after a bug fix or a logic change, and show exactly what the [[source]] sent.' },
    { id:'pj10-q6', q:'"How would you scale it to many charts or much more data?"', a:'[[Parameterize]] extract by playlist and run charts in parallel, store raw data as [[Parquet]] in object storage like S3 or GCS, load into [[partitioned]] cloud-warehouse tables, move the SQL views to [[dbt]] models with tests, and orchestrate with [[Airflow]] for retries and backfills.' },
    { id:'pj10-q7', q:'"What would you change for streaming?"', a:'The official chart only changes [[daily]], so streaming adds nothing for this source. For real-time play events I\'d publish to [[Kafka]] topics, use [[idempotent]] consumers (at-least-once delivery means duplicates), handle [[late-arriving]] events with time windows, and keep the daily batch for the official chart.' },
    { id:'pj10-q8', q:'"How do you test it?"', a:'pytest [[unit tests]] on clean_rows, using the [[tmp_path]] fixture to write fake raw files. They check that positions follow order, duplicates are rejected and missing titles are rejected, and they run in the workflow [[before]] the pipeline. Next I\'d add a load test that runs load twice and asserts the count is [[unchanged]].' },
    { id:'pj10-q9', q:'"How does chart_movement work?"', a:'It\'s a view using LAG(position) OVER (PARTITION BY [[track_id]] ORDER BY [[chart_date]]) to get each song\'s previous position. places_gained is prev_position minus position, so [[positive]] means it climbed and [[NULL]] marks a new entry.' },
    { id:'pj10-q10', q:'"What are the limitations, and what would you improve first?"', a:'There\'s no [[transaction]] around delete and insert, asserts are skipped under python [[-O]], there\'s no [[backfill]] option, dependencies aren\'t [[pinned]], and the DuckDB file is committed to Git so the repo grows. I\'d add a transaction, explicit checks, a --from-raw option, pinned versions and alerting.' }
  ],
  problems:[
    { id:'pj10-p1', kind:'open', title:'Follow-up under pressure',
      scenario:'Interviewer: <i>"At 07:17 Deezer returned HTTP 500. What happens to today\'s data, and what do you do?"</i> Answer as you would out loud.',
      hint:'Trace the code: extract → raise_for_status → which steps run? What\'s in the warehouse? Then: immediate action and long-term fix.',
      solution:`What happens: requests.get gets a 500 and resp.raise_for_status() raises HTTPError inside extract(). run_pipeline.py stops (fail-fast), so transform, load and build_models never run, and the commit step never runs. The warehouse is unchanged and still correct up to yesterday. No partial data.

What I do: the failed run shows in the Actions tab. I re-run it with workflow_dispatch the same day, before Deezer updates the chart, because the API can't give me today's chart later. The load is idempotent, so re-running is safe.

Long-term: add retries with back-off for 5xx/429 inside extract, and an alert (e.g. a notification on workflow failure) so I don't rely on checking manually.`,
      explain:'A strong answer <b>traces the actual code path</b>, states the data impact ("no partial data"), gives the immediate action, and names a structural fix. That\'s the Point → Evidence → Trade-off → Improvement frame.' }
  ]
}
];

const CURRICULUM = { modules: [
{ id:'sql', num:1, title:'SQL fundamentals → intermediate', icon:'🗄️', status:'ready',
  blurb:'The #1 skill in every data engineering interview. SELECT to window functions.',
  lessons: SQL_LESSONS_A.concat(SQL_LESSONS_B) },
{ id:'proj', num:'P1', title:'Master Project 1: Naija Chart Pipeline', icon:'🇳🇬', status:'ready', db:'project',
  requires:['etl1','etl2','etl3','etl4'],
  repo:'https://github.com/orimogunjetolu/naija-chart-pipeline',
  blurb:'Your own portfolio repo, line by line: extract, transform, load, SQL models, tests, CI. Then defend it in a mock interview.',
  lessons: PROJECT_LESSONS_A.concat(PROJECT_LESSONS_B) },
{ id:'py', num:2, title:'Python for data', icon:'🐍', status:'soon', blurb:'The glue language of pipelines.',
  lessons:[ {id:'py1',title:'Types, lists & dicts'},{id:'py2',title:'Functions & error handling'},
    {id:'py3',title:'Files, CSV & JSON'},{id:'py4',title:'Calling APIs with requests'},
    {id:'py5',title:'pandas basics: DataFrames, filter, groupby'},{id:'py6',title:'pandas cleaning & merging'} ]},
{ id:'model', num:3, title:'Data modeling & warehousing', icon:'🏛️', status:'soon', blurb:'Shape data so it answers questions fast.',
  lessons:[ {id:'mo1',title:'OLTP vs OLAP'},{id:'mo2',title:'Normalization (1NF–3NF)'},
    {id:'mo3',title:'Star schema: facts & dimensions'},{id:'mo4',title:'Slowly Changing Dimensions (SCD 1/2)'},
    {id:'mo5',title:'Columnar storage & partitioning'} ]},
{ id:'etl', num:4, title:'ETL / ELT pipelines', icon:'🔁', status:'ready',
  blurb:'Move data reliably. Built around your Deezer Top Nigeria pipeline.', lessons: ETL_LESSONS },
{ id:'orch', num:5, title:'Orchestration (Airflow)', icon:'⏱️', status:'soon', blurb:'Run many dependent jobs reliably.',
  lessons:[ {id:'or1',title:'Why orchestration (beyond cron)'},{id:'or2',title:'Airflow DAGs, tasks & operators'},
    {id:'or3',title:'Scheduling, retries & catchup/backfills'},{id:'or4',title:'Dependencies, sensors & XComs'},
    {id:'or5',title:'Monitoring, alerting & SLAs'} ]},
{ id:'cloud', num:6, title:'Cloud & tools', icon:'☁️', status:'soon', blurb:'The everyday toolkit of a remote data engineer.',
  lessons:[ {id:'cl1',title:'Git & GitHub workflow (branches, PRs)'},{id:'cl2',title:'Docker basics for pipelines'},
    {id:'cl3',title:'Object storage: S3 / GCS & Parquet'},{id:'cl4',title:'Cloud warehouses: BigQuery & Snowflake'},
    {id:'cl5',title:'dbt: models, refs & tests'} ]},
{ id:'job', num:7, title:'Interview & job prep', icon:'💼', status:'soon', blurb:'Turn skills into a remote offer.',
  lessons:[ {id:'jb1',title:'SQL interview patterns (top-N, dedupe, gaps)'},{id:'jb2',title:'Telling project stories (STAR)'},
    {id:'jb3',title:'Pipeline system design basics'},{id:'jb4',title:'Remote job search, CV & GitHub profile'},
    {id:'jb5',title:'Mock interviews & take-home tasks'} ]}
]};

'use strict';
/* ============================ CORE ============================ */
const STORE_KEY = 'deLearn.v1';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const z2 = n => String(n).padStart(2, '0');
function today(d) { d = d || new Date(); return d.getFullYear() + '-' + z2(d.getMonth() + 1) + '-' + z2(d.getDate()); }
function addDays(ds, n) { const p = ds.split('-').map(Number); return today(new Date(p[0], p[1] - 1, p[2] + n)); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const LANG_NAME = { sql: 'SQL', python: 'Python', yaml: 'YAML', bash: 'shell', ini: 'pytest.ini' };
const isText = it => it.kind !== 'code';
const DATASETS = {
  music: { label: 'Music sample (artists, songs, chart_entries)', sql: DATASET_SQL, schema: DATASET_SCHEMA },
  project: { label: 'Project 1: chart_entries (same columns as your DuckDB table)', sql: PROJECT_SQL, schema: PROJECT_SCHEMA }
};

/* ---------- index the curriculum ---------- */
const LESSONS = {}, ITEMS = {}, PROBLEMS = {}, READY = [];
CURRICULUM.modules.forEach(m => {
  if (m.status !== 'ready') return;
  READY.push(m);
  m.lessons.forEach((l, li) => {
    l.module = m.id; l.index = li; LESSONS[l.id] = l;
    l.itemIds = [];
    (l.terms || []).forEach(t => { ITEMS[t.id] = { id: t.id, kind: 'term', lesson: l.id, module: m.id, front: t.term, text: t.def }; l.itemIds.push(t.id); });
    (l.code || []).forEach(c => { ITEMS[c.id] = { id: c.id, kind: 'code', lesson: l.id, module: m.id, front: c.task, text: c.code, lang: c.lang, run: c.lang === 'sql' && c.run !== false, show: c.show, runSql: c.runSql, src: c.src, db: m.db || 'music' }; l.itemIds.push(c.id); });
    (l.qa || []).forEach(q => { ITEMS[q.id] = { id: q.id, kind: 'qa', lesson: l.id, module: m.id, front: q.q, text: q.a }; l.itemIds.push(q.id); });
    (l.problems || []).forEach(p => { PROBLEMS[p.id] = Object.assign({ lesson: l.id, module: m.id, db: m.db || 'music' }, p); });
  });
});

/* ---------- state ---------- */
function defaultState() {
  return { v: 2, xp: 0, streak: 0, best: 0, lastActive: null, days: {}, items: {}, cards: {}, theory: {}, problems: {},
    settings: { minutes: 25, newPerDay: 8, focus: 'sql' }, created: today() };
}
let S, STORAGE_OK = true;
function loadState() {
  let raw = null;
  try { raw = localStorage.getItem(STORE_KEY); } catch (e) { STORAGE_OK = false; }
  const d = defaultState();
  if (!raw) return d;
  try { const o = JSON.parse(raw); return migrate(Object.assign(d, o, { settings: Object.assign(d.settings, o.settings || {}) })); }
  catch (e) { return d; }
}
/* v1 -> v2: new module only adds item ids; keep every existing record, drop nothing. */
function migrate(s) {
  ['items', 'cards', 'theory', 'problems', 'days'].forEach(k => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
  if (!CURRICULUM.modules.some(m => m.id === s.settings.focus && m.status === 'ready')) s.settings.focus = 'sql';
  s.v = 2; return s;
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { STORAGE_OK = false; } }

/* ---------- XP, streak, levels ---------- */
function addXP(n) {
  const t = today();
  if (S.lastActive !== t) {
    S.streak = (S.lastActive === addDays(t, -1)) ? S.streak + 1 : 1;
    S.lastActive = t; S.best = Math.max(S.best || 0, S.streak);
  }
  S.xp += n;
  const d = S.days[t] || (S.days[t] = { xp: 0, steps: 0 });
  d.xp += n; d.steps++;
  if (SESSION) SESSION.xp += n;
  save();
}
function currentStreak() { const t = today(); return (S.lastActive === t || S.lastActive === addDays(t, -1)) ? S.streak : 0; }
const XP_PER_LEVEL = 300;
function levelInfo() { return { level: Math.floor(S.xp / XP_PER_LEVEL) + 1, frac: (S.xp % XP_PER_LEVEL) / XP_PER_LEVEL, toNext: XP_PER_LEVEL - (S.xp % XP_PER_LEVEL) }; }
const RANKS = ['Data Curious', 'Query Writer', 'Join Juggler', 'Pipeline Apprentice', 'Junior Data Engineer', 'Pipeline Builder', 'Data Engineer', 'Senior-in-Training'];
function rankName(lv) { return RANKS[Math.min(RANKS.length - 1, Math.floor((lv - 1) / 2))]; }

function itemProgress(id) { const s = S.items[id]; if (!s) return 0; if (s.mastered) return 1; return s.lvl / 5; }
function lessonProgress(l) {
  const ids = l.itemIds; if (!ids || !ids.length) return 0;
  const ip = ids.reduce((a, id) => a + itemProgress(id), 0) / ids.length;
  const ps = l.problems || []; const pp = ps.length ? ps.filter(p => S.problems[p.id] && S.problems[p.id].solved).length / ps.length : 1;
  return ip * 0.85 + pp * 0.15 * (ip > 0 ? 1 : 0);
}
function moduleProgress(m) { if (m.status !== 'ready') return 0; return m.lessons.reduce((a, l) => a + lessonProgress(l), 0) / m.lessons.length; }

/* ---------- fade parsing ---------- */
function plain(text) { return text.replace(/\{\{|\}\}/g, '').replace(/\[\[(.+?)\]\]/g, (m, a) => a.split('|')[0]); }
function keySegments(text) {
  const t = text.replace(/\{\{|\}\}/g, ''); const segs = []; const re = /\[\[(.+?)\]\]/g; let last = 0, m;
  while ((m = re.exec(t))) { if (m.index > last) segs.push({ s: t.slice(last, m.index) }); const alts = m[1].split('|'); segs.push({ blank: true, s: alts[0], alts }); last = re.lastIndex; }
  if (last < t.length) segs.push({ s: t.slice(last) });
  return segs;
}
function phraseSegments(item) {
  const text = item.text;
  if (isText(item)) {
    if (/\{\{/.test(text)) {
      const t = text.replace(/\[\[(.+?)\]\]/g, (m, a) => a.split('|')[0]); const segs = []; const re = /\{\{(.+?)\}\}/g; let last = 0, m;
      while ((m = re.exec(t))) { if (m.index > last) segs.push({ s: t.slice(last, m.index) }); segs.push({ blank: true, s: m[1], alts: [m[1]], long: true }); last = re.lastIndex; }
      if (last < t.length) segs.push({ s: t.slice(last) });
      return segs;
    }
    // auto: span from first to last keyword, extended to a clause boundary if short
    const ks = keySegments(text); let pos = 0, start = -1, end = -1, full = '';
    ks.forEach(sg => { if (sg.blank) { if (start < 0) start = pos; end = pos + sg.s.length; } full += sg.s; pos += sg.s.length; });
    while (end < full.length && /[\w\-()]/.test(full[end])) end++;
    if (end - start < 18) { const m = full.slice(end).search(/[;.,:]/); end = m < 0 ? full.length : end + m; }
    return [{ s: full.slice(0, start) }, { blank: true, s: full.slice(start, end).trim(), alts: [full.slice(start, end).trim()], long: true }, { s: full.slice(end) }].filter(x => x.blank || x.s);
  }
  // code: blank up to 2 whole lines containing the most keywords
  const lines = text.split('\n');
  const scored = lines.map((ln, i) => ({ i, n: (ln.match(/\[\[/g) || []).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n || a.i - b.i);
  const chosen = new Set(scored.slice(0, 2).map(x => x.i));
  const segs = [];
  lines.forEach((ln, i) => {
    const p = plain(ln);
    if (chosen.has(i)) { const ind = p.match(/^\s*/)[0]; if (ind) segs.push({ s: ind }); segs.push({ blank: true, s: p.trim(), alts: [p.trim()], long: true }); }
    else segs.push({ s: p });
    if (i < lines.length - 1) segs.push({ s: '\n' });
  });
  return segs;
}

/* ---------- answer checking ---------- */
function norm(s) {
  return String(s).toLowerCase().replace(/[\u2018\u2019`]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ').replace(/\s*([(),;=<>+\-*\/.:\[\]{}])\s*/g, '$1').replace(/;+$/, '').trim();
}
function lev(a, b) {
  if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
function checkBlank(input, alts, long) {
  const n = norm(input); if (!n) return false;
  for (const a of alts) {
    const na = norm(a); if (n === na) return 'exact';
    if (na.length >= 5 && 1 - lev(n, na) / Math.max(n.length, na.length) >= (long ? 0.85 : 0.8)) return 'close';
  }
  return false;
}
const STOP = new Set('the a an of to and or in on for is are be by with as at it its that this from which where when then than into each one can not no so such e.g. usually'.split(' '));
function tokens(s) { return norm(s).split(/[^a-z0-9_*%<>=!]+/).filter(Boolean); }
function recallScore(input, item) {
  const keys = keySegments(item.text).filter(x => x.blank).map(x => x.s);
  const req = new Set(); keys.forEach(k => tokens(k).forEach(t => req.add(t)));
  tokens(plain(item.text)).forEach(t => { if (t.length >= 3 && !STOP.has(t)) req.add(t); });
  const have = tokens(input); const hs = new Set(have);
  const found = t => hs.has(t) || (t.length >= 5 && have.some(h => Math.abs(h.length - t.length) <= 1 && lev(h, t) <= 1));
  const list = [...req]; const got = list.filter(found).length;
  const missingKeys = keys.filter(k => !tokens(k).every(found));
  return { score: list.length ? got / list.length : 0, missingKeys };
}

/* ---------- fade-item progression ---------- */
function itemState(id) { return S.items[id] || (S.items[id] = { lvl: 1, due: today(), right: 0, wrong: 0, seen: null, intro: today(), mastered: false }); }
function answerFade(id, correct) {
  const st = itemState(id), t = today(), before = st.lvl; let event = null;
  if (correct) {
    st.right++; addXP(5 * st.lvl);
    if (st.lvl >= 4) { st.mastered = true; addCard(id); event = 'mastered'; }
    else { st.lvl++; event = 'up'; }
    st.due = addDays(t, 1);
  } else {
    st.wrong++; st.lvl = Math.max(1, st.lvl - 1); st.due = t; addXP(1); event = before > 1 ? 'down' : 'stay';
  }
  st.seen = t; save();
  return { event, lvl: st.lvl, before };
}

/* ---------- SM-2 flashcards ---------- */
function addCard(id) { if (!S.cards[id]) S.cards[id] = { ease: 2.5, ivl: 0, reps: 0, lapses: 0, due: addDays(today(), 1), added: today() }; }
function sm2(c, g) { // g: 0 Again, 1 Hard, 2 Good, 3 Easy
  const n = Object.assign({}, c);
  if (g === 0) { n.reps = 0; n.lapses = (n.lapses || 0) + 1; n.ease = Math.max(1.3, n.ease - 0.2); n.ivl = 0; n.due = today(); return n; }
  if (n.reps === 0) n.ivl = g === 3 ? 4 : 1;
  else if (n.reps === 1) n.ivl = g === 1 ? 3 : g === 2 ? 6 : 8;
  else n.ivl = Math.max(n.ivl + 1, Math.round(n.ivl * (g === 1 ? 1.2 : g === 2 ? n.ease : n.ease * 1.3)));
  if (g === 1) n.ease = Math.max(1.3, n.ease - 0.15);
  if (g === 3) n.ease = n.ease + 0.15;
  n.reps++; n.due = addDays(today(), n.ivl);
  return n;
}
function ivlLabel(c, g) { const n = sm2(c, g); return g === 0 ? 'again today' : n.ivl === 1 ? '1 day' : n.ivl < 30 ? n.ivl + ' days' : Math.round(n.ivl / 30) + ' mo'; }
function gradeCard(id, g) { S.cards[id] = sm2(S.cards[id], g); addXP(g === 0 ? 1 : 4); save(); }

/* ---------- session builder ---------- */
const COST = { card: 0.35, fade: 1, fadeHi: 1.5, newItem: 1.6, theory: 3, problem: 5 };
function orderedReadyModules() { const f = S.settings.focus; return READY.slice().sort((a, b) => (b.id === f) - (a.id === f)); }
function lessonStarted(id) { const l = LESSONS[id]; return !!(l && S.theory[id] && l.itemIds.every(x => S.items[x])); }
function moduleUnlocked(m) { return !m.requires || m.requires.every(lessonStarted); }
function nextLesson() {
  for (const m of orderedReadyModules()) if (moduleUnlocked(m)) for (const l of m.lessons) {
    if (!S.theory[l.id] || l.itemIds.some(id => !S.items[id])) return l;
  }
  return null;
}
function pickProblem(cur) {
  const all = Object.values(PROBLEMS);
  const open = all.filter(p => (S.theory[p.lesson] || (cur && p.lesson === cur.id)) && !(S.problems[p.id] && S.problems[p.id].solved));
  const mods = orderedReadyModules().map(m => m.id);
  open.sort((a, b) => mods.indexOf(a.module) - mods.indexOf(b.module));
  if (open.length) return open[0];
  const seen = all.filter(p => S.problems[p.id]).sort((a, b) => (S.problems[a.id].last || '') < (S.problems[b.id].last || '') ? -1 : 1);
  return seen[0] || (cur ? PROBLEMS[cur.problems[0] && cur.problems[0].id] : null) || null;
}
function buildDailySession() {
  const t = today(), budget = S.settings.minutes; const steps = []; let mins = 0;
  const cards = Object.keys(S.cards).filter(id => ITEMS[id] && S.cards[id].due <= t).sort((a, b) => S.cards[a].due < S.cards[b].due ? -1 : 1);
  const maxCards = Math.max(12, Math.floor(budget * 0.4 / COST.card));
  const cardIds = cards.slice(0, maxCards); cardIds.forEach(id => steps.push({ type: 'card', id })); mins += cardIds.length * COST.card;
  const fades = Object.keys(S.items).filter(id => ITEMS[id] && !S.items[id].mastered && S.items[id].due <= t)
    .sort((a, b) => (S.items[a].due < S.items[b].due ? -1 : S.items[a].due > S.items[b].due ? 1 : S.items[a].lvl - S.items[b].lvl));
  const fadeCap = Math.max(6, (budget - mins) * 0.6); let fadeN = 0;
  for (const id of fades) { const c = S.items[id].lvl >= 3 ? COST.fadeHi : COST.fade; if (fadeN && mins + c > fadeCap + cardIds.length * COST.card) break; steps.push({ type: 'fade', id }); mins += c; fadeN++; }
  const inProgress = Object.keys(S.items).filter(id => !S.items[id].mastered).length;
  let lesson = null, newN = 0, theory = false;
  if (inProgress <= 30 && budget - mins - COST.problem >= 4) {
    lesson = nextLesson();
    if (lesson) {
      let rem = budget - mins - COST.problem;
      if (!S.theory[lesson.id]) { steps.push({ type: 'theory', lesson: lesson.id }); mins += COST.theory; rem -= COST.theory; theory = true; }
      const newIds = lesson.itemIds.filter(id => !S.items[id]);
      const k = Math.min(newIds.length, S.settings.newPerDay, Math.max(3, Math.floor(rem / COST.newItem)));
      newIds.slice(0, k).forEach(id => steps.push({ type: 'fade', id, isNew: true })); mins += k * COST.newItem; newN = k;
    }
  }
  const prob = pickProblem(lesson);
  if (prob) { steps.push({ type: 'problem', id: prob.id }); mins += COST.problem; }
  return { steps, mins: Math.max(1, Math.round(mins)), counts: { cards: cardIds.length, fades: fadeN, newN, theory, lesson, problem: prob }, mode: 'daily' };
}
function buildLessonSession(lid) {
  const l = LESSONS[lid]; const steps = [{ type: 'theory', lesson: lid }];
  l.itemIds.forEach(id => { if (S.items[id] && S.items[id].mastered) steps.push({ type: 'card', id }); else steps.push({ type: 'fade', id, isNew: !S.items[id] }); });
  l.problems.forEach(p => steps.push({ type: 'problem', id: p.id }));
  return { steps, mins: Math.round(COST.theory + l.itemIds.length * 1.3 + l.problems.length * COST.problem), mode: 'lesson', lesson: l };
}
function buildCardSession() {
  const t = today(); const ids = Object.keys(S.cards).filter(id => ITEMS[id] && S.cards[id].due <= t);
  return { steps: ids.map(id => ({ type: 'card', id })), mins: Math.max(1, Math.round(ids.length * COST.card)), mode: 'cards' };
}

/* ============================ SQL ENGINE ============================ */
let SQLP = null;
function b64ToBytes(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function getSQL() {
  if (!SQLP) {
    if (typeof initSqlJs === 'function' && typeof SQL_WASM_B64 === 'string') {
      SQLP = initSqlJs({ wasmBinary: b64ToBytes(SQL_WASM_B64) });
      SQLP.catch(() => { SQLP = null; });
    } else return Promise.reject(new Error('SQL engine is not bundled in this file.'));
  }
  return SQLP;
}
async function runSQL(query, setup, dbKey) {
  const SQL = await getSQL(); const db = new SQL.Database();
  try { db.exec((DATASETS[dbKey] || DATASETS.music).sql); if (setup) db.exec(setup); const r = db.exec(query); return r.length ? r[r.length - 1] : { columns: [], values: [] }; }
  finally { db.close(); }
}
function tableHTML(r, max) {
  max = max || 50;
  if (!r.columns.length) return '<div class="muted small">✓ Statement ran. No rows returned.</div>';
  const rows = r.values.slice(0, max).map(v => '<tr>' + v.map(x => x === null ? '<td class="null">NULL</td>' : '<td>' + esc(typeof x === 'number' && !Number.isInteger(x) ? +x.toFixed(4) : x) + '</td>').join('') + '</tr>').join('');
  return '<div class="tblwrap"><table><thead><tr>' + r.columns.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="muted small">' + r.values.length + ' row' + (r.values.length === 1 ? '' : 's') + (r.values.length > max ? ' (showing ' + max + ')' : '') + '</div>';
}
function normRows(r, ordered) {
  const rows = r.values.map(v => JSON.stringify(v.map(x => typeof x === 'number' ? Math.round(x * 100) / 100 : x === null ? null : String(x).trim())));
  return ordered ? rows : rows.sort();
}
function compareResults(user, exp, ordered) {
  if (user.columns.length !== exp.columns.length) return { ok: false, msg: 'Expected ' + exp.columns.length + ' column(s) (' + exp.columns.join(', ') + '), you returned ' + user.columns.length + '.' };
  if (user.values.length !== exp.values.length) return { ok: false, msg: 'Expected ' + exp.values.length + ' row(s), you returned ' + user.values.length + '.' };
  const a = normRows(user, ordered), b = normRows(exp, ordered);
  if (a.join('|') === b.join('|')) return { ok: true };
  if (ordered && normRows(user, false).join('|') === normRows(exp, false).join('|')) return { ok: false, msg: 'Right rows, wrong order. Check your ORDER BY.' };
  return { ok: false, msg: 'Same shape, but some values differ. Compare with the expected output.' };
}

/* ============================ UI STATE ============================ */
let SESSION = null;          // running session
let F = null;                // current step UI state
const UI = { screen: 'home', params: {} };
const app = () => document.getElementById('app');

function go(screen, params, replace) {
  UI.screen = screen; UI.params = params || {};
  try { history[replace ? 'replaceState' : 'pushState']({ screen, params: UI.params }, ''); } catch (e) {}
  render(); window.scrollTo(0, 0);
}
window.addEventListener('popstate', e => {
  const st = e.state || { screen: 'home' };
  if (UI.screen === 'session' && SESSION && st.screen !== 'session') SESSION = null;
  UI.screen = st.screen === 'session' && !SESSION ? 'home' : st.screen; UI.params = st.params || {}; render();
});
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400); }

function nav(active) {
  const tabs = [['home', '🏠', 'Today'], ['roadmap', '🗺️', 'Roadmap'], ['cards', '🃏', 'Cards'], ['lab', '🧪', 'SQL Lab'], ['settings', '⚙️', 'More']];
  return '<nav class="tabs">' + tabs.map(t => '<button class="tab ' + (t[0] === active ? 'on' : '') + '" data-act="go" data-to="' + t[0] + '"><span>' + t[1] + '</span>' + t[2] + '</button>').join('') + '</nav>';
}
function bar(frac, cls) { return '<div class="bar ' + (cls || '') + '"><i style="width:' + Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%"></i></div>'; }
function lvBadge(frac) { return '<span class="lv">Lv ' + Math.floor(Math.min(1, frac) * 5) + '/5</span>'; }

function render() {
  const v = { home: viewHome, session: viewSession, summary: viewSummary, roadmap: viewRoadmap, lesson: viewLesson, cards: viewCards, lab: viewLab, settings: viewSettings }[UI.screen] || viewHome;
  app().innerHTML = v();
  const af = app().querySelector('[data-autofocus]'); if (af && UI.screen === 'session') { try { af.focus({ preventScroll: true }); } catch (e) {} }
}

/* ============================ HOME ============================ */
function viewHome() {
  const plan = buildDailySession(); UI.plan = plan;
  const lv = levelInfo(), st = currentStreak(), t = today(); const done = S.days[t] && S.days[t].session;
  const c = plan.counts; const li = [];
  if (c.cards) li.push('<li>🃏 <b>' + c.cards + '</b> flashcard review' + (c.cards > 1 ? 's' : '') + '</li>');
  if (c.fades) li.push('<li>🔁 <b>' + c.fades + '</b> fade-recall review' + (c.fades > 1 ? 's' : '') + '</li>');
  if (c.lesson) li.push('<li>📘 ' + (c.theory ? 'New lesson: ' : 'Continue: ') + '<b>' + esc(c.lesson.title) + '</b>' + (c.newN ? ' · ' + c.newN + ' new items' : '') + '</li>');
  if (c.problem) li.push('<li>🧩 Problem: <b>' + esc(c.problem.title) + '</b></li>');
  if (!li.length) li.push('<li>🎉 Everything is up to date. Use Roadmap to drill any lesson.</li>');
  let week = '';
  for (let i = 6; i >= 0; i--) { const d = addDays(t, -i); const on = S.days[d] && S.days[d].xp > 0; week += '<div class="day ' + (on ? 'on' : '') + (i === 0 ? ' today' : '') + '"><i></i><span>' + 'SMTWTFS'[new Date(d + 'T12:00:00').getDay()] + '</span></div>'; }
  const mods = READY.map(m => { const p = moduleProgress(m); return '<div class="modrow" data-act="go" data-to="roadmap"><span>' + m.icon + ' ' + esc(m.title) + '</span>' + bar(p) + '<small>' + Math.round(p * 100) + '%</small></div>'; }).join('');
  return '<header class="top"><h1>DE Daily</h1><div class="muted small">Data engineering, 25 minutes a day</div></header>' +
    '<main>' +
    '<section class="stats">' +
      '<div class="stat"><b>🔥 ' + st + '</b><span>day streak</span></div>' +
      '<div class="stat"><b>⭐ ' + S.xp + '</b><span>XP</span></div>' +
      '<div class="stat"><b>Lv ' + lv.level + '</b><span>' + esc(rankName(lv.level)) + '</span></div>' +
    '</section>' + bar(lv.frac, 'xp') + '<div class="muted small right">' + lv.toNext + ' XP to level ' + (lv.level + 1) + '</div>' +
    '<section class="card today">' +
      '<div class="row"><h2>' + (done ? 'Bonus round' : "Today's session") + '</h2><span class="pill">⏱ ~' + plan.mins + ' min</span></div>' +
      (done ? '<p class="ok small">✅ You already finished today\'s session. Another round adds more XP.</p>' : '') +
      '<ul class="plan">' + li.join('') + '</ul>' +
      '<button class="btn primary big" data-act="startDaily" id="startBtn"' + (plan.steps.length ? '' : ' disabled') + '>▶ Start today\'s session</button>' +
      '<div class="muted small center">Reviews first, then new material, then one problem.</div>' +
    '</section>' +
    '<section class="week">' + week + '</section>' +
    '<section class="card"><h3>Progress</h3>' + mods + '</section>' +
    (STORAGE_OK ? '' : '<p class="bad small">⚠️ Your browser is blocking local storage, so progress won\'t be saved. Use More → Export backup.</p>') +
    '</main>' + nav('home');
}

/* ============================ SESSION ============================ */
function startSession(plan) {
  SESSION = { steps: plan.steps.slice(), i: 0, mode: plan.mode, start: Date.now(), xp: 0, requeued: {}, second: {},
    stats: { right: 0, wrong: 0, ups: 0, mastered: 0, cards: 0, problems: 0, solved: 0, theory: 0 } };
  F = null; go('session');
}
function insertBeforeProblems(step) {
  let k = SESSION.steps.length;
  while (k > SESSION.i + 1 && SESSION.steps[k - 1].type === 'problem') k--;
  SESSION.steps.splice(Math.max(k, SESSION.i + 1), 0, step);
}
function nextStep() {
  SESSION.i++; F = null;
  if (SESSION.i >= SESSION.steps.length) return endSession();
  render(); window.scrollTo(0, 0);
}
function endSession() {
  const t = today(); const d = S.days[t] || (S.days[t] = { xp: 0, steps: 0 });
  if (SESSION.mode === 'daily') d.session = true;
  d.mins = (d.mins || 0) + Math.round((Date.now() - SESSION.start) / 60000);
  save(); UI.last = SESSION; SESSION = null; go('summary', {}, true);
}
function viewSession() {
  if (!SESSION) return viewHome();
  const step = SESSION.steps[SESSION.i]; const n = SESSION.steps.length;
  const head = '<header class="sess"><button class="x" data-act="quit" aria-label="Quit">✕</button>' + bar(SESSION.i / n, 'sessbar') + '<span class="muted small">' + (SESSION.i + 1) + '/' + n + '</span><span class="xpgain">+' + SESSION.xp + '</span></header>';
  let body = '';
  if (step.type === 'theory') body = viewTheory(step);
  else if (step.type === 'fade') body = viewFade(step);
  else if (step.type === 'card') body = viewCard(step);
  else if (step.type === 'problem') body = viewProblem(step);
  return head + '<main class="step">' + body + '</main>';
}

/* ---------- theory ---------- */
function theoryHTML(l) {
  const th = l.theory; const m = CURRICULUM.modules.find(x => x.id === l.module);
  return '<div class="kicker">' + m.icon + ' ' + (typeof m.num === 'number' ? 'Module ' + m.num : 'Master Project ' + m.num.slice(1)) + ' · Lesson ' + (l.index + 1) + ' · Theory</div><h2>' + esc(l.title) + '</h2>' +
    '<div class="why"><div class="label">First principles: why does this exist?</div><p>' + th.why + '</p></div>' +
    th.body.map(p => '<p>' + p + '</p>').join('') +
    '<div class="pro"><div class="label">🎙 Say it like a pro</div><p>' + esc(th.pro) + '</p></div>' +
    '<div class="think"><div class="label">🤔 Think first</div><p>' + esc(th.q.q) + '</p>' +
      '<details><summary>Reveal answer</summary><p>' + esc(th.q.a) + '</p></details></div>' +
    (l.terms.length ? '<div class="label">Key terms you\'ll drill</div><div class="chips static">' + l.terms.map(t => '<span class="chip">' + esc(t.term) + '</span>').join('') + '</div>' : '') +
    (l.qa && l.qa.length ? '<div class="label">' + (l.terms.length ? '💥 What breaks if… (you\'ll drill these)' : '🎤 Interview questions you\'ll drill') + '</div><ul class="qlist">' + l.qa.map(q => '<li>' + esc(q.q) + '</li>').join('') + '</ul>' : '');
}
function viewTheory(step) {
  const l = LESSONS[step.lesson];
  return theoryHTML(l) + '<div class="actions"><button class="btn primary big" data-act="theoryDone" data-autofocus>Got it → practise</button></div>';
}

/* ---------- fade exercise ---------- */
function distractors(it, keys, n) {
  const pool = new Set(); const kl = new Set(keys.map(k => norm(k)));
  Object.values(ITEMS).forEach(o => { if (o.kind === it.kind && o.id !== it.id && (o.module === it.module || it.kind === 'code')) keySegments(o.text).filter(s => s.blank).forEach(s => { if (!kl.has(norm(s.s)) && (it.kind !== 'code' || o.lang === it.lang)) pool.add(s.s); }); });
  if (pool.size < n) Object.values(ITEMS).forEach(o => { if (o.kind === it.kind && o.id !== it.id) keySegments(o.text).filter(s => s.blank).forEach(s => { if (!kl.has(norm(s.s))) pool.add(s.s); }); });
  return shuffle([...pool]).slice(0, n);
}
function initFade(step) {
  const it = ITEMS[step.id]; const st = itemState(step.id); const lvl = st.lvl;
  const f = { id: step.id, lvl, checked: false, vals: [], res: [], snap: JSON.stringify(st) };
  if (lvl <= 2) f.segs = keySegments(it.text);
  else if (lvl === 3) f.segs = phraseSegments(it);
  f.blanks = f.segs ? f.segs.filter(s => s.blank) : [];
  if (lvl === 1) { const keys = f.blanks.map(b => b.s); f.options = shuffle(keys.concat(distractors(it, keys, Math.max(3, 7 - keys.length)))); f.chosen = f.blanks.map(() => null); f.used = f.options.map(() => false); }
  return f;
}
function segHTML(f) {
  let bi = 0;
  return f.segs.map(sg => {
    if (!sg.blank) return esc(sg.s);
    const i = bi++;
    if (f.lvl === 1) {
      const v = f.chosen[i]; const cls = f.checked ? (f.res[i] ? 'ok' : 'bad') : (v != null ? 'filled' : '');
      const txt = f.checked && !f.res[i] ? '<s>' + esc(v != null ? f.options[v] : '') + '</s> ' + esc(sg.s) : v != null ? esc(f.options[v]) : '\u00a0'.repeat(Math.min(14, Math.max(5, sg.s.length)));
      return '<span class="slot ' + cls + '" data-act="unslot" data-i="' + i + '">' + txt + '</span>';
    }
    const cls = f.checked ? (f.res[i] ? 'ok' : 'bad') : '';
    return '<span class="gap ' + cls + '">' + (f.checked ? esc(sg.s) : '(' + (i + 1) + ')' + (sg.long ? ' ……' : ' ___')) + '</span>';
  }).join('');
}
function viewFade(step) {
  if (!F || F.id !== step.id || F.stepIndex !== SESSION.i) { F = initFade(step); F.stepIndex = SESSION.i; }
  const it = ITEMS[step.id]; const f = F; const L = LESSONS[it.lesson];
  const lvlNames = ['', 'Choose the keywords', 'Type the missing words', 'Type the missing phrase / line', 'Full recall'];
  let h = '<div class="kicker">' + (it.kind === 'term' ? '📖 Definition' : it.kind === 'qa' ? '🎤 Question' : '💻 ' + LANG_NAME[it.lang] + ' code' + (it.src ? ' · <span class="srcf">' + esc(it.src.split('|').join(' + ')) + '</span>' : '')) + ' · ' + esc(L.title) + (step.isNew && !step.second ? ' · <b class="new">NEW</b>' : '') + '</div>' +
    '<div class="ladder">' + [1, 2, 3, 4].map(n => '<i class="' + (n < f.lvl ? 'done' : n === f.lvl ? 'cur' : '') + '">' + n + '</i>').join('') + '<span>Level ' + f.lvl + ': ' + lvlNames[f.lvl] + '</span></div>';
  h += it.kind === 'term' ? '<h2>' + (f.lvl === 4 ? 'Define from memory: ' : '') + esc(it.front) + '</h2>' : '<h2 class="task">' + (it.kind === 'qa' && f.lvl === 4 ? 'Answer from memory: ' : '') + esc(it.front) + '</h2>';
  if (f.lvl <= 3) {
    h += it.kind === 'code' ? '<pre class="code">' + segHTML(f) + '</pre>' : '<p class="def">' + segHTML(f) + '</p>';
    if (f.lvl === 1) {
      h += '<div class="chips">' + f.options.map((o, i) => '<button class="chip ' + (f.used[i] ? 'used' : '') + '" data-act="chip" data-i="' + i + '"' + (f.used[i] || f.checked ? ' disabled' : '') + '>' + esc(o) + '</button>').join('') + '</div>';
      if (!f.checked) h += '<div class="muted small">Tap a word to fill the next blank. Tap a filled blank to clear it.</div>';
    } else {
      h += '<div class="inputs">' + f.blanks.map((b, i) => '<label class="inp ' + (f.checked ? (f.res[i] ? 'ok' : 'bad') : '') + '"><span>' + (i + 1) + '</span><input type="text" data-i="' + i + '" value="' + esc(f.vals[i] || '') + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' + (f.checked ? ' disabled' : '') + (i === 0 ? ' data-autofocus' : '') + ' placeholder="' + (b.long ? (it.kind === 'code' ? 'type the whole line' : 'type the phrase') : 'type the word(s)') + '"></label>').join('') + '</div>';
    }
  } else {
    h += '<p class="muted">' + (it.kind === 'term' ? 'Write the full definition in your own words. Use the key technical terms.' : it.kind === 'qa' ? 'Answer in your own words, as you would in an interview. Hit the key terms.' : 'Write the whole ' + LANG_NAME[it.lang] + ' snippet.') + '</p>' +
      '<textarea class="recall' + (it.kind === 'code' ? ' mono' : '') + '" rows="' + (it.kind === 'code' ? 7 : 4) + '" data-i="0" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' + (f.checked ? ' disabled' : '') + ' data-autofocus>' + esc(f.vals[0] || '') + '</textarea>';
  }
  // feedback / actions
  if (!f.checked) {
    const ready = f.lvl === 1 ? f.chosen.every(v => v != null) : true;
    h += '<div class="actions"><button class="btn primary big" data-act="checkFade"' + (ready ? '' : ' disabled') + '>' + (f.lvl === 4 ? 'Check my answer' : 'Check') + '</button>' +
      (f.lvl > 1 ? '<button class="btn ghost" data-act="dontKnow">I don\'t know: show me</button>' : '') + '</div>';
  } else if (f.lvl === 4 && !f.graded) {
    const sc = f.score; const pct = Math.round(sc.score * 100);
    h += '<div class="feedback ' + (pct >= 75 ? 'good' : 'meh') + '"><b>Keyword match: ' + pct + '%</b>' + (sc.missingKeys.length ? '<br>Missing key terms: ' + sc.missingKeys.map(k => '<code>' + esc(k) + '</code>').join(' ') : '<br>All key terms present.') + '</div>' +
      '<div class="label">Model answer</div>' + (it.kind === 'code' ? '<pre class="code">' + esc(plain(it.text)) + '</pre>' : '<p class="def model">' + esc(plain(it.text)) + '</p>') +
      runBox(it) +
      '<div class="muted small">Same meaning counts. You decide:</div>' +
      '<div class="actions two"><button class="btn bad" data-act="selfGrade" data-ok="0">✗ I was wrong</button><button class="btn good' + (pct >= 75 ? ' primary' : '') + '" data-act="selfGrade" data-ok="1">✓ I was right</button></div>';
  } else {
    const o = f.outcome;
    const msg = o.correct ? (o.event === 'mastered' ? '🏆 Mastered! It joins your flashcard deck.' : '✅ Correct! Next time: Level ' + o.lvl + '.') + (f.close ? ' <span class="muted">(small typo accepted)</span>' : '')
      : (o.event === 'down' ? '↩️ Not quite. Dropping back to Level ' + o.lvl + '. You\'ll see it again soon.' : '↩️ Not quite. You\'ll see it again at the end.');
    h += '<div class="feedback ' + (o.correct ? 'good' : 'badfb') + '">' + msg + '</div>';
    if (!o.correct) h += '<div class="label">Full answer</div>' + (it.kind === 'code' ? '<pre class="code">' + esc(plain(it.text)) + '</pre>' : '<p class="def model">' + esc(plain(it.text)) + '</p>');
    h += runBox(it);
    h += '<div class="actions"><button class="btn primary big" data-act="next" data-autofocus>Continue</button>' +
      (!o.correct && f.lvl <= 3 && !f.overridden ? '<button class="btn ghost" data-act="override">I was actually right (typo or synonym)</button>' : '') + '</div>';
  }
  return h;
}
function runBox(it) {
  if (!it.run) return '';
  return '<div class="runbox"><button class="btn small" data-act="runItem" data-id="' + it.id + '">▶ Run this SQL on the chart data</button><div class="out" id="out-' + it.id + '"></div></div>';
}
function finishFade(correct) {
  const step = SESSION.steps[SESSION.i]; const o = answerFade(step.id, correct);
  F.checked = true; F.outcome = { correct, event: o.event, lvl: o.lvl };
  if (correct) { SESSION.stats.right++; if (o.event === 'mastered') SESSION.stats.mastered++; else SESSION.stats.ups++; }
  else SESSION.stats.wrong++;
  if (!correct && !SESSION.requeued[step.id]) { SESSION.requeued[step.id] = true; insertBeforeProblems({ type: 'fade', id: step.id, retry: true }); F.requeuedNow = true; }
  if (correct && step.isNew && o.lvl === 2 && !SESSION.second[step.id]) { SESSION.second[step.id] = true; insertBeforeProblems({ type: 'fade', id: step.id, second: true, isNew: true }); }
}

/* ---------- flashcard ---------- */
function viewCard(step) {
  if (!F || F.stepIndex !== SESSION.i) F = { id: step.id, stepIndex: SESSION.i, shown: false };
  const it = ITEMS[step.id]; const c = S.cards[step.id] || { ease: 2.5, ivl: 0, reps: 0 };
  let h = '<div class="kicker">🃏 Flashcard · ' + esc(LESSONS[it.lesson].title) + '</div><div class="flash">';
  h += it.kind === 'term' ? '<div class="muted small">Define</div><h2>' + esc(it.front) + '</h2>' : it.kind === 'qa' ? '<div class="muted small">Answer</div><h2 class="task">' + esc(it.front) + '</h2>' : '<div class="muted small">Write the ' + LANG_NAME[it.lang] + (it.src ? ' (' + esc(it.src.split('|')[0]) + ')' : '') + '</div><h2 class="task">' + esc(it.front) + '</h2>';
  if (F.shown) h += '<hr>' + (it.kind === 'code' ? '<pre class="code">' + esc(plain(it.text)) + '</pre>' : '<p class="def model">' + esc(plain(it.text)) + '</p>');
  h += '</div>';
  if (!F.shown) h += '<div class="actions"><button class="btn primary big" data-act="showCard" data-autofocus>Show answer</button></div>';
  else {
    h += runBox(it) + '<div class="grades">' + [['Again', 0, 'bad'], ['Hard', 1, 'meh'], ['Good', 2, 'good'], ['Easy', 3, 'easy']].map(g => '<button class="btn grade ' + g[2] + '" data-act="gradeCard" data-g="' + g[1] + '"><b>' + g[0] + '</b><small>' + ivlLabel(c, g[1]) + '</small></button>').join('') + '</div>';
  }
  return h;
}

/* ---------- problem ---------- */
function viewProblem(step) {
  const p = PROBLEMS[step.id];
  if (!F || F.stepIndex !== SESSION.i) F = { id: step.id, stepIndex: SESSION.i, code: '', out: '', revealed: false, hint: false, solved: false, check: null };
  const f = F; const L = LESSONS[p.lesson];
  let h = '<div class="kicker">🧩 Problem · ' + esc(L.title) + (S.problems[p.id] && S.problems[p.id].solved && !f.solved ? ' · solved before' : '') + '</div><h2>' + esc(p.title) + '</h2><div class="scenario">' + p.scenario + '</div>';
  if (p.kind === 'sql') {
    h += '<details class="schema"><summary>Tables available</summary>' + DATASETS[p.db].schema.map(s => '<div><code>' + s[0] + '</code>: ' + esc(s[1]) + '</div>').join('') + (p.setup ? '<div><code>raw_loads</code>: created for this problem</div>' : '') + '</details>' +
      '<textarea class="mono editor" id="probCode" rows="8" placeholder="Write your SQL here…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">' + esc(f.code) + '</textarea>' +
      '<div class="actions three"><button class="btn" data-act="runProb">▶ Run</button><button class="btn primary" data-act="checkProb">✓ Check</button><button class="btn ghost" data-act="hint">Hint</button></div>';
    if (f.hint) h += '<div class="hintbox">💡 ' + esc(p.hint) + '</div>';
    if (f.check) h += '<div class="feedback ' + (f.check.ok ? 'good' : 'badfb') + '">' + (f.check.ok ? '✅ Correct! Your result matches the expected output. +30 XP' : '✗ ' + esc(f.check.msg)) + '</div>';
    h += '<div class="out" id="probOut">' + f.out + '</div>';
  } else {
    h += '<textarea class="editor" id="probCode" rows="8" placeholder="Type your answer… (say it out loud first)" autocapitalize="sentences">' + esc(f.code) + '</textarea>';
    if (!f.revealed) h += '<div class="actions two"><button class="btn ghost" data-act="hint">Hint</button><button class="btn primary" data-act="reveal">Compare with model answer</button></div>';
    if (f.hint) h += '<div class="hintbox">💡 ' + esc(p.hint) + '</div>';
  }
  if (f.revealed || f.solved) {
    h += '<div class="label">Worked solution</div><pre class="code">' + esc(p.solution) + '</pre><div class="explain">' + p.explain + '</div>';
    if (p.kind === 'sql' && !f.expOut) h += '<button class="btn small" data-act="expOut">Show expected output</button>';
    if (f.expOut) h += '<div class="label">Expected output</div>' + f.expOut;
  }
  if (p.kind === 'open' && f.revealed && !f.graded) {
    h += '<div class="muted small">How close was your answer?</div><div class="actions three"><button class="btn bad" data-act="openGrade" data-g="0">Missed it</button><button class="btn meh" data-act="openGrade" data-g="1">Partly</button><button class="btn good" data-act="openGrade" data-g="2">Nailed it</button></div>';
  } else if (f.solved || f.revealed) {
    h += '<div class="actions"><button class="btn primary big" data-act="probDone">Continue</button></div>';
  } else {
    h += '<div class="actions">' + (p.kind === 'sql' ? '<button class="btn ghost" data-act="reveal">Show worked solution</button>' : '') + '<button class="btn ghost" data-act="next">Skip for now</button></div>';
  }
  return h;
}

/* ---------- summary ---------- */
function viewSummary() {
  const s = UI.last; if (!s) return viewHome();
  const st = s.stats; const tot = st.right + st.wrong; const acc = tot ? Math.round(st.right / tot * 100) : null;
  const mins = Math.max(1, Math.round((Date.now() - s.start) / 60000));
  const tomorrow = addDays(today(), 1);
  const dueT = Object.values(S.cards).filter(c => c.due <= tomorrow).length + Object.values(S.items).filter(i => !i.mastered && i.due <= tomorrow).length;
  return '<main class="summary"><div class="big-emoji">🎉</div><h1>Session complete</h1>' +
    '<section class="stats"><div class="stat"><b>+' + s.xp + '</b><span>XP earned</span></div><div class="stat"><b>🔥 ' + currentStreak() + '</b><span>day streak</span></div><div class="stat"><b>' + mins + ' min</b><span>time</span></div></section>' +
    '<ul class="plan">' + (acc !== null ? '<li>🎯 Recall accuracy: <b>' + acc + '%</b> (' + st.right + '/' + tot + ')</li>' : '') +
    (st.ups ? '<li>⬆️ <b>' + st.ups + '</b> item' + (st.ups > 1 ? 's' : '') + ' moved up a level</li>' : '') +
    (st.mastered ? '<li>🏆 <b>' + st.mastered + '</b> mastered → added to flashcards</li>' : '') +
    (st.cards ? '<li>🃏 <b>' + st.cards + '</b> flashcards reviewed</li>' : '') +
    (st.problems ? '<li>🧩 Problems: <b>' + st.solved + '/' + st.problems + '</b> solved</li>' : '') +
    '<li>📅 Tomorrow: about <b>' + dueT + '</b> reviews waiting</li></ul>' +
    '<button class="btn primary big" data-act="go" data-to="home">Back home</button></main>';
}

/* ============================ ROADMAP / LESSON ============================ */
function viewRoadmap() {
  const nl = nextLesson();
  const mods = CURRICULUM.modules.map(m => {
    const ready = m.status === 'ready'; const p = moduleProgress(m);
    let h = '<section class="card mod ' + (ready ? '' : 'soon') + (m.db === 'project' ? ' project' : '') + '"><div class="row"><h3>' + m.icon + ' ' + (typeof m.num === 'number' ? m.num + '. ' : '') + esc(m.title) + '</h3>' + (ready ? '<small>' + Math.round(p * 100) + '%</small>' : '<span class="pill grey">Coming soon</span>') + '</div>' +
      '<div class="muted small">' + esc(m.blurb) + '</div>' +
      (m.requires && ready ? (moduleUnlocked(m) ? '<div class="small ok">🔓 Unlocked: daily sessions now offer these lessons.</div>' : '<div class="small muted">🔒 Daily sessions offer this after ETL lessons 1–4. You can open any lesson now.</div>') : '') +
      (m.repo ? '<div class="small">Repo: <a href="' + m.repo + '" target="_blank" rel="noopener">' + esc(m.repo.replace('https://', '')) + '</a></div>' : '');
    if (ready) {
      h += bar(p) + (S.settings.focus === m.id ? '<div class="small ok">★ Current focus: new lessons come from here first</div>' : '<button class="btn small" data-act="focus" data-m="' + m.id + '">Make this my focus</button>');
      h += '<ol class="lessons">' + m.lessons.map(l => { const lp = lessonProgress(l); return '<li data-act="go" data-to="lesson" data-l="' + l.id + '" class="' + (nl && nl.id === l.id ? 'next' : '') + '"><span>' + esc(l.title) + (nl && nl.id === l.id ? ' <b class="new">NEXT</b>' : '') + '</span>' + lvBadge(lp) + bar(lp, 'thin') + '</li>'; }).join('') + '</ol>';
    } else h += '<ol class="lessons soon">' + m.lessons.map(l => '<li><span>' + esc(l.title) + '</span></li>').join('') + '</ol>';
    return h + '</section>';
  }).join('');
  return '<header class="top"><h1>Roadmap</h1><div class="muted small">Aimed at remote entry-level data engineering roles</div></header><main>' + mods + '</main>' + nav('roadmap');
}
function viewLesson() {
  const l = LESSONS[UI.params.l]; if (!l) return viewRoadmap();
  const lp = lessonProgress(l); const lvlTxt = id => { const s = S.items[id]; return !s ? '<span class="lvl0">new</span>' : s.mastered ? '<span class="lvlM">🏆 mastered</span>' : '<span class="lvlN">L' + s.lvl + '</span>'; };
  return '<header class="top"><button class="back" data-act="go" data-to="roadmap">‹ Roadmap</button><h1>' + esc(l.title) + '</h1></header><main>' +
    '<section class="card">' + lvBadge(lp) + bar(lp) +
    '<button class="btn primary big" data-act="startLesson" data-l="' + l.id + '">▶ Practise this lesson</button>' +
    '<div class="muted small center">Theory, every item at its current level, then the problems.</div></section>' +
    '<section class="card"><details><summary><b>📘 Read the theory</b></summary>' + theoryHTML(l) + '</details></section>' +
    '<section class="card">' + (l.terms.length ? '<h3>Terms</h3><ul class="items">' + l.terms.map(t => '<li><span>' + esc(t.term) + '</span>' + lvlTxt(t.id) + '</li>').join('') + '</ul>' : '') +
    (l.code.length ? '<h3>Code</h3><ul class="items">' + l.code.map(c => '<li><span>' + esc(c.task) + '</span>' + lvlTxt(c.id) + '</li>').join('') + '</ul>' : '') +
    (l.qa && l.qa.length ? '<h3>' + (l.terms.length ? 'What breaks if…' : 'Interview questions') + '</h3><ul class="items">' + l.qa.map(q => '<li><span>' + esc(q.q) + '</span>' + lvlTxt(q.id) + '</li>').join('') + '</ul>' : '') +
    '<h3>Problems</h3><ul class="items">' + l.problems.map(p => '<li><span>' + esc(p.title) + '</span>' + (S.problems[p.id] && S.problems[p.id].solved ? '<span class="lvlM">✓ solved</span>' : '<span class="lvl0">open</span>') + '</li>').join('') + '</ul></section>' +
    '</main>' + nav('roadmap');
}

/* ============================ CARDS ============================ */
function viewCards() {
  const t = today(); const ids = Object.keys(S.cards).filter(id => ITEMS[id]); const due = ids.filter(id => S.cards[id].due <= t);
  const inProg = Object.keys(S.items).filter(id => !S.items[id].mastered).length;
  const list = ids.sort((a, b) => S.cards[a].due < S.cards[b].due ? -1 : 1).slice(0, 60).map(id => '<li><span>' + esc(ITEMS[id].front) + '</span><small>' + (S.cards[id].due <= t ? '<b class="ok">due</b>' : S.cards[id].due) + '</small></li>').join('');
  return '<header class="top"><h1>Flashcards</h1><div class="muted small">Spaced repetition (SM-2). Fade items join here once mastered.</div></header><main>' +
    '<section class="stats"><div class="stat"><b>' + due.length + '</b><span>due now</span></div><div class="stat"><b>' + ids.length + '</b><span>in deck</span></div><div class="stat"><b>' + inProg + '</b><span>still on the fade ladder</span></div></section>' +
    '<section class="card"><button class="btn primary big" data-act="startCards"' + (due.length ? '' : ' disabled') + '>▶ Review ' + due.length + ' due card' + (due.length === 1 ? '' : 's') + '</button>' +
    (ids.length ? '' : '<p class="muted small">Your deck is empty for now. An item joins once you pass it at Level 4 (full recall). Daily sessions get you there in about 4 days per item.</p>') + '</section>' +
    '<section class="card"><h3>AnkiDroid export</h3><p class="small muted">Downloads a tab-separated .txt file. In AnkiDroid: ⋮ → Import → pick the file. Fields: Front, Back, Tags.</p>' +
    '<div class="actions two"><button class="btn" data-act="anki" data-all="0">Export my deck (' + ids.length + ')</button><button class="btn" data-act="anki" data-all="1">Export all items (' + Object.keys(ITEMS).length + ')</button></div></section>' +
    (list ? '<section class="card"><h3>Deck</h3><ul class="items">' + list + '</ul></section>' : '') +
    '</main>' + nav('cards');
}

/* ============================ SQL LAB ============================ */
const LAB_SAMPLES_PROJECT = [
  ['Latest chart', "SELECT position, title, artist\nFROM chart_entries\nWHERE chart_date = (SELECT MAX(chart_date) FROM chart_entries)\nORDER BY position;"],
  ['chart_movement', "SELECT * FROM chart_movement\nORDER BY chart_date DESC, position;"],
  ['artist_summary', "SELECT * FROM artist_summary;"]
];
const LAB_SAMPLES = [
  ['Today\'s chart', "SELECT c.position, s.title, a.name AS artist, c.streams\nFROM chart_entries c\nJOIN songs s ON s.song_id = c.song_id\nJOIN artists a ON a.artist_id = s.artist_id\nWHERE c.chart_date = '2026-10-17'\nORDER BY c.position;"],
  ['Movement (LAG)', "SELECT chart_date, song_id, position,\n  LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date) AS prev\nFROM chart_entries\nORDER BY song_id, chart_date;"],
  ['Artist totals', "SELECT a.name, SUM(c.streams) AS total\nFROM chart_entries c\nJOIN songs s ON s.song_id = c.song_id\nJOIN artists a ON a.artist_id = s.artist_id\nGROUP BY a.artist_id, a.name\nORDER BY total DESC;"],
  ['List tables', "SELECT name, sql FROM sqlite_master WHERE type = 'table';"]
];
function viewLab() {
  const db = UI.labDb || 'music'; const samples = db === 'project' ? LAB_SAMPLES_PROJECT : LAB_SAMPLES;
  if (UI.labCode == null) UI.labCode = samples[0][1];
  return '<header class="top"><h1>SQL Lab</h1><div class="muted small">Real SQLite running offline in your browser. Experiment freely; the data resets every run.</div></header><main>' +
    '<section class="card"><div class="seg">' + Object.keys(DATASETS).map(k => '<button class="' + (k === db ? 'on' : '') + '" data-act="labDb" data-db="' + k + '">' + (k === 'music' ? 'Music sample' : 'Project 1 data') + '</button>').join('') + '</div>' +
    '<details><summary><b>Tables</b></summary>' + DATASETS[db].schema.map(s => '<div class="small"><code>' + s[0] + '</code>: ' + esc(s[1]) + '</div>').join('') + '<div class="small muted">Sample data inspired by the Deezer Top Nigeria chart. Positions and stream counts are illustrative.</div></details>' +
    '<div class="chips">' + samples.map((s, i) => '<button class="chip" data-act="labSample" data-i="' + i + '">' + esc(s[0]) + '</button>').join('') + '</div>' +
    '<textarea class="mono editor" id="labCode" rows="9" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">' + esc(UI.labCode) + '</textarea>' +
    '<div class="actions"><button class="btn primary big" data-act="labRun">▶ Run query</button></div><div class="out" id="labOut">' + (UI.labOut || '') + '</div></section>' +
    '</main>' + nav('lab');
}

/* ============================ SETTINGS ============================ */
function seg(name, vals, cur, fmt) { return '<div class="seg">' + vals.map(v => '<button class="' + (v === cur ? 'on' : '') + '" data-act="setting" data-k="' + name + '" data-v="' + v + '">' + (fmt ? fmt(v) : v) + '</button>').join('') + '</div>'; }
function viewSettings() {
  const total = Object.keys(ITEMS).length, probs = Object.keys(PROBLEMS).length;
  return '<header class="top"><h1>More</h1></header><main>' +
    '<section class="card"><h3>Daily session length</h3>' + seg('minutes', [20, 25, 30], S.settings.minutes, v => v + ' min') +
    '<h3>New items per day (max)</h3>' + seg('newPerDay', [5, 8, 12], S.settings.newPerDay) + '</section>' +
    '<section class="card"><h3>Backup</h3><p class="small muted">Progress is saved on this device (localStorage). Export a backup regularly, or to move to another phone.</p>' +
    '<div class="actions two"><button class="btn" data-act="exportJSON">⬇ Export progress (.json)</button><label class="btn filebtn">⬆ Import backup<input type="file" accept=".json,application/json" id="importFile" hidden></label></div>' +
    '<details><summary class="small">Import by pasting text instead</summary><textarea id="importText" rows="4" class="mono" placeholder="Paste backup JSON here"></textarea><button class="btn small" data-act="importPaste">Import pasted backup</button></details></section>' +
    '<section class="card"><h3>AnkiDroid</h3><div class="actions two"><button class="btn" data-act="anki" data-all="0">Export my deck</button><button class="btn" data-act="anki" data-all="1">Export all items</button></div></section>' +
    '<section class="card"><h3>How this app teaches</h3><ul class="small plan">' +
      '<li><b>3 layers per lesson:</b> first-principles theory and fluent terms → writing code → realistic problems.</li>' +
      '<li><b>Fade-recall ladder:</b> L1 choose keywords → L2 type a few words → L3 type whole phrases or lines → L4 full recall. A correct answer moves an item up a level, a miss moves it down one.</li>' +
      '<li><b>Flashcards:</b> after you pass L4 the item joins an SM-2 spaced-repetition deck (Again / Hard / Good / Easy).</li>' +
      '<li><b>Daily session:</b> due reviews first, then new material, then one problem.</li>' +
      '<li>Content: ' + READY.reduce((a, m) => a + m.lessons.length, 0) + ' lessons, ' + total + ' drill items, ' + probs + ' problems.</li></ul></section>' +
    '<section class="card"><h3>Danger zone</h3><button class="btn bad" data-act="reset">Reset all progress</button></section>' +
    '<p class="muted small center">DE Daily · works offline · v1.0</p></main>' + nav('settings');
}

/* ============================ EXPORT / IMPORT ============================ */
function download(name, text, type) {
  const blob = new Blob([text], { type: type || 'text/plain' }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}
function buildAnki(all) {
  const ids = all ? Object.keys(ITEMS) : Object.keys(S.cards).filter(id => ITEMS[id]);
  const clean = s => s.replace(/[\t\r\n]+/g, ' ');
  const lines = ['#separator:tab', '#html:true', '#tags column:3'];
  ids.forEach(id => {
    const it = ITEMS[id];
    const front = it.kind === 'term' ? '<b>' + esc(it.front) + '</b><br><i>Define it</i>' : it.kind === 'qa' ? '<b>' + esc(it.front) + '</b><br><i>Answer it</i>' : esc(it.front) + '<br><i>Write the ' + LANG_NAME[it.lang] + (it.src ? ' (' + esc(it.src.split('|')[0]) + ')' : '') + '</i>';
    const back = isText(it) ? esc(plain(it.text)) : '<pre style="text-align:left">' + esc(plain(it.text)).replace(/\n/g, '<br>') + '</pre>';
    lines.push([front, back, 'DE::' + it.module + '::' + it.lesson + ' DE::' + it.kind].map(clean).join('\t'));
  });
  return { text: lines.join('\n') + '\n', n: ids.length };
}
function importData(txt) {
  let o; try { o = JSON.parse(txt); } catch (e) { toast('That file is not valid JSON.'); return; }
  if (!o || typeof o !== 'object' || !('items' in o) || !('xp' in o)) { toast('This does not look like a DE Daily backup.'); return; }
  if (!confirm('Replace your current progress with this backup?')) return;
  const d = defaultState(); S = Object.assign(d, o, { settings: Object.assign(d.settings, o.settings || {}) }); save(); toast('Backup imported ✓'); go('home');
}

/* ============================ ACTIONS ============================ */
const ACT = {
  go: el => go(el.dataset.to, el.dataset.l ? { l: el.dataset.l } : {}),
  startDaily: () => { const p = buildDailySession(); if (p.steps.length) startSession(p); },
  startLesson: el => startSession(buildLessonSession(el.dataset.l)),
  startCards: () => { const p = buildCardSession(); if (p.steps.length) startSession(p); },
  quit: () => { if (confirm('End the session now? Everything you answered is already saved.')) { SESSION.stats.quit = true; endSession(); } },
  next: () => nextStep(),
  theoryDone: () => { const st = SESSION.steps[SESSION.i]; const first = !S.theory[st.lesson]; S.theory[st.lesson] = S.theory[st.lesson] || today(); addXP(first ? 10 : 3); SESSION.stats.theory++; nextStep(); },
  chip: el => { const i = +el.dataset.i; const slot = F.chosen.indexOf(null); if (slot < 0 || F.used[i]) return; F.chosen[slot] = i; F.used[i] = true; render(); },
  unslot: el => { if (F.checked) return; const s = +el.dataset.i; const v = F.chosen[s]; if (v == null) return; F.used[v] = false; F.chosen[s] = null; render(); },
  checkFade: () => {
    const it = ITEMS[F.id];
    if (F.lvl === 1) { F.res = F.blanks.map((b, i) => !!checkBlank(F.options[F.chosen[i]], b.alts, false)); }
    else if (F.lvl <= 3) { collectInputs(); F.res = F.blanks.map((b, i) => { const r = checkBlank(F.vals[i] || '', b.alts, b.long); if (r === 'close') F.close = true; return !!r; }); }
    else { collectInputs(); F.score = recallScore(F.vals[0] || '', it); F.checked = true; render(); return; }
    finishFade(F.res.every(Boolean)); render();
  },
  dontKnow: () => { collectInputs(); F.res = F.blanks.map(() => false); if (F.lvl === 4) { F.score = recallScore('', ITEMS[F.id]); F.graded = true; } finishFade(false); render(); },
  selfGrade: el => { F.graded = true; finishFade(el.dataset.ok === '1'); render(); },
  override: () => {
    const step = SESSION.steps[SESSION.i];
    S.items[step.id] = JSON.parse(F.snap); SESSION.stats.wrong--;
    if (F.requeuedNow) { const k = SESSION.steps.findIndex((s, j) => j > SESSION.i && s.id === step.id && s.retry); if (k > 0) SESSION.steps.splice(k, 1); SESSION.requeued[step.id] = false; }
    F.overridden = true; F.res = F.res.map(() => true); finishFade(true); render();
  },
  showCard: () => { F.shown = true; render(); },
  gradeCard: el => {
    const g = +el.dataset.g; const step = SESSION.steps[SESSION.i]; gradeCard(step.id, g); SESSION.stats.cards++;
    if (g === 0 && !SESSION.requeued['c' + step.id]) { SESSION.requeued['c' + step.id] = true; insertBeforeProblems({ type: 'card', id: step.id }); }
    nextStep();
  },
  runItem: async el => {
    const it = ITEMS[el.dataset.id]; const out = document.getElementById('out-' + it.id); out.innerHTML = '<div class="muted small">Running…</div>';
    try { const r = await runSQL((it.runSql || plain(it.text)) + (it.show ? '\n' + it.show : ''), null, it.db); out.innerHTML = (it.runSql ? '<div class="muted small">Ran the SQLite equivalent (DuckDB-only syntax swapped).</div>' : '') + tableHTML(r, 12); } catch (e) { out.innerHTML = '<div class="bad small">' + esc(e.message) + '</div>'; }
  },
  runProb: async () => {
    const p = PROBLEMS[F.id]; F.code = document.getElementById('probCode').value; F.check = null;
    try { const r = await runSQL(F.code + (p.after ? '\n;' + p.after : ''), p.setup, p.db); F.out = tableHTML(r, 30); } catch (e) { F.out = '<div class="bad small">SQL error: ' + esc(e.message) + '</div>'; }
    render();
  },
  checkProb: async () => {
    const p = PROBLEMS[F.id]; F.code = document.getElementById('probCode').value;
    if (!F.code.trim()) { toast('Write a query first'); return; }
    try {
      const ex = p.after ? '\n;' + p.after : '';
      const [u, e] = [await runSQL(F.code + ex, p.setup, p.db), await runSQL(p.solution + ex, p.setup, p.db)];
      F.out = tableHTML(u, 30); F.check = compareResults(u, e, !!p.ordered);
      const ps = S.problems[p.id] || (S.problems[p.id] = { solved: false, tries: 0 }); ps.tries++; ps.last = today();
      if (F.check.ok && !F.solved) { F.solved = true; ps.solved = true; addXP(30); SESSION.stats.solved++; }
      save();
    } catch (err) { F.out = '<div class="bad small">SQL error: ' + esc(err.message) + '</div>'; F.check = { ok: false, msg: 'Your query has an error (see below).' }; }
    render();
  },
  hint: () => { const el = document.getElementById('probCode'); if (el) F.code = el.value; F.hint = true; render(); },
  reveal: () => { const el = document.getElementById('probCode'); if (el) F.code = el.value; F.revealed = true; render(); },
  expOut: async () => { const p = PROBLEMS[F.id]; try { F.expOut = tableHTML(await runSQL(p.solution + (p.after ? '\n;' + p.after : ''), p.setup, p.db), 30); } catch (e) { F.expOut = '<div class="bad small">' + esc(e.message) + '</div>'; } render(); },
  openGrade: el => {
    const g = +el.dataset.g; const p = PROBLEMS[F.id]; const ps = S.problems[p.id] || (S.problems[p.id] = { solved: false, tries: 0 });
    ps.tries++; ps.last = today(); if (g === 2) { ps.solved = true; SESSION.stats.solved++; }
    addXP([5, 15, 30][g]); F.graded = true; SESSION.stats.problems++; save(); nextStep();
  },
  probDone: () => {
    const p = PROBLEMS[F.id]; SESSION.stats.problems++;
    if (!F.solved) { const ps = S.problems[p.id] || (S.problems[p.id] = { solved: false, tries: 0 }); ps.tries++; ps.last = today(); addXP(5); save(); }
    nextStep();
  },
  focus: el => { S.settings.focus = el.dataset.m; save(); toast('Focus set'); render(); },
  setting: el => { S.settings[el.dataset.k] = +el.dataset.v; save(); render(); },
  labSample: el => { UI.labCode = (UI.labDb === 'project' ? LAB_SAMPLES_PROJECT : LAB_SAMPLES)[+el.dataset.i][1]; UI.labOut = ''; render(); },
  labDb: el => { UI.labDb = el.dataset.db; UI.labCode = null; UI.labOut = ''; render(); },
  labRun: async () => {
    UI.labCode = document.getElementById('labCode').value; const out = document.getElementById('labOut'); out.innerHTML = '<div class="muted small">Running…</div>';
    try { UI.labOut = tableHTML(await runSQL(UI.labCode, null, UI.labDb || 'music'), 100); } catch (e) { UI.labOut = '<div class="bad small">SQL error: ' + esc(e.message) + '</div>'; }
    out.innerHTML = UI.labOut;
  },
  exportJSON: () => { download('de-daily-backup-' + today() + '.json', JSON.stringify(S, null, 1), 'application/json'); toast('Backup downloaded'); },
  importPaste: () => importData(document.getElementById('importText').value),
  anki: el => { const r = buildAnki(el.dataset.all === '1'); if (!r.n) { toast('Your deck is empty. Try "Export all items".'); return; } download('de-daily-anki-' + today() + '.txt', r.text, 'text/plain'); toast(r.n + ' cards exported'); },
  reset: () => { if (confirm('Delete ALL progress (XP, streak, levels, cards)? Export a backup first if unsure.')) { S = defaultState(); save(); toast('Progress reset'); go('home'); } }
};
function collectInputs() { app().querySelectorAll('[data-i]').forEach(el => { if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') F.vals[+el.dataset.i] = el.value; }); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => { if (F && e.target.dataset && e.target.dataset.i != null && UI.screen === 'session') F.vals[+e.target.dataset.i] = e.target.value; });
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || UI.screen !== 'session' || !F) return;
  if (e.target.tagName === 'INPUT') {
    e.preventDefault();
    const ins = [...app().querySelectorAll('.inputs input')]; const k = ins.indexOf(e.target);
    if (k >= 0 && k < ins.length - 1) ins[k + 1].focus(); else if (!F.checked) ACT.checkFade();
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'importFile' && e.target.files[0]) { const r = new FileReader(); r.onload = () => importData(r.result); r.readAsText(e.target.files[0]); }
});

/* ============================ INIT ============================ */
S = loadState(); save(); // persist any v1→v2 migration immediately
try { history.replaceState({ screen: 'home', params: {} }, ''); } catch (e) {}
render();
if (/^https?:$/.test(location.protocol)) {
  const l = document.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.json'; document.head.appendChild(l);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
setTimeout(() => { getSQL().catch(() => {}); }, 400); // warm up the SQL engine

