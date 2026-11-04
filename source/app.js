
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
   are illustrative. Each song has one main genre (v8.1: genre
   moved from artists to songs, because an artist can have several genres
   and a cell holds one value). Loaded fresh into SQLite for every query. */
const DATASET_SQL = `
CREATE TABLE artists (
  artist_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);
INSERT INTO artists VALUES
 (1,'Ayra Starr'),(2,'Victony'),(3,'FOLA'),(4,'Kizz Daniel'),(5,'Omah Lay'),
 (6,'Blaqbonez'),(7,'Brymo'),(8,'Asake'),(9,'Young Jonn'),(10,'BNXN'),
 (11,'LAZER DIM 700'),(12,'Burna Boy'),(13,'Tems'),(14,'Rema');

CREATE TABLE songs (
  song_id      INTEGER PRIMARY KEY,
  title        TEXT NOT NULL,
  artist_id    INTEGER REFERENCES artists(artist_id),
  duration_sec INTEGER,
  genre        TEXT
);
INSERT INTO songs VALUES
 (1,'Heaven Baby',1,159,'Afrobeats'),(2,'SLICK',2,106,'Afrobeats'),(3,'waf',3,161,NULL),
 (4,'Owo Oluwa',4,177,'Afrobeats'),(5,'DON''T LOVE ME',5,181,'Afrobeats'),
 (6,'IKEBE 3000',6,197,'Hip-hop'),(7,'Love Na Drug',7,237,'Alternative'),
 (8,'Forgiveness',8,158,'Afrobeats'),(9,'Elumelu',9,133,'Afrobeats'),(10,'Online',10,172,'Afrobeats'),
 (11,'Goodbye (Warm Up)',1,163,'Afrobeats'),(12,'Freddy Kooger',11,103,'Hip-hop'),
 (13,'Money Good',7,152,'Alternative'),(14,'Calm Down',14,239,'Afrobeats');

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

CREATE TABLE listeners (
  listener_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  city        TEXT
);
INSERT INTO listeners VALUES
 (1,'Ada','Lagos'),(2,'Tunde','Ibadan'),(3,'Zainab','Kano'),(4,'Chidi','Enugu');

CREATE TABLE streams (
  stream_id   INTEGER PRIMARY KEY,
  listener_id INTEGER REFERENCES listeners(listener_id),
  song_id     INTEGER REFERENCES songs(song_id),
  streamed_at TEXT
);
INSERT INTO streams VALUES
 (1,1,14,'2026-10-17 21:14'),(2,1,8,'2026-10-17 21:18'),(3,2,14,'2026-10-17 22:02'),
 (4,2,1,'2026-10-18 07:30'),(5,4,14,'2026-10-18 08:05'),(6,1,14,'2026-10-18 09:12');

CREATE TABLE playlists (
  playlist_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL
);
INSERT INTO playlists VALUES (1,'Naija Hits'),(2,'Chill Vibes');

CREATE TABLE playlist_songs (
  playlist_id INTEGER REFERENCES playlists(playlist_id),
  song_id     INTEGER REFERENCES songs(song_id),
  PRIMARY KEY (playlist_id, song_id)
);
INSERT INTO playlist_songs VALUES (1,14),(1,8),(1,2),(2,7),(2,14),(2,13);
`;

const DATASET_SCHEMA = [
  ['artists', 'artist_id (PK), name: 14 rows (Burna Boy and Tems have no songs here)'],
  ['songs', 'song_id (PK), title, artist_id (FK → artists), duration_sec, genre: 14 rows (one main genre per song; waf has a NULL genre)'],
  ['chart_entries', 'chart_date, position, song_id (FK → songs), streams: 30 rows (top 10 for 2026-10-15/16/17; one NULL stream count)'],
  ['listeners', 'listener_id (PK), name, city: 4 rows (Zainab has never streamed)'],
  ['streams', 'stream_id (PK), listener_id (FK → listeners), song_id (FK → songs), streamed_at: 6 events'],
  ['playlists', 'playlist_id (PK), name: 2 rows'],
  ['playlist_songs', 'playlist_id (FK → playlists), song_id (FK → songs), PK (playlist_id, song_id): linking table, 6 rows']
];

const SQL_LESSONS_A = [
{ id:'sql1', title:'Tables, keys & SELECT',
  theory:{
    why:'Before databases, data lived in files and spreadsheets. They break when many people edit at once, when rows reach the millions, or when the same fact (an artist\'s name) is copied into hundreds of places and someone updates only one copy. In 1970 Edgar Codd proposed the <b>relational model</b>: store each kind of fact in its own <b>table</b>, give every row a <b>key</b>, and link tables through keys. You then describe <i>what</i> result you want and the database works out <i>how</i> to get it.',
    body:[
      'A <b>table</b> is a set of <b>rows</b> (records) that share the same <b>columns</b> (attributes). Each column has a <b>data type</b> (INTEGER, TEXT, DATE…). The full list of tables, columns, types and rules is the <b>schema</b>.',
      'A <b>primary key</b> (PK) uniquely identifies each row and can never be NULL (that is the SQL standard; SQLite has one old exception, explained in "What\'s inside a table", which is why SQLite tables often say <code>PRIMARY KEY NOT NULL</code>). In our dataset <code>songs.song_id</code> is the PK. A <b>foreign key</b> (FK) such as <code>songs.artist_id</code> points to the PK of another table, so an artist\'s name is stored once and referenced everywhere.',
      'SQL is <b>declarative</b>. <code>SELECT title FROM songs</code> says what you want; the <b>query planner</b> decides whether to scan the table or use an index. SQL is also a <b>standard</b>, so the same basic queries run on Postgres, BigQuery, Snowflake or DuckDB (the engine in your Deezer chart pipeline). Each engine adds its own <b>dialect</b> differences, which you will meet along the way.',
      '<code>SELECT</code> chooses columns (and can compute expressions), <code>FROM</code> names the table, and <code>AS</code> gives a result column an <b>alias</b>.'
    ],
    pro:'"The songs table has song_id as its primary key and artist_id as a foreign key to artists, so artist attributes are stored once and joined in at query time."',
    q:{ q:'Why not just store the artist name directly in every chart row?', a:'Because the same fact would be repeated many times. If an artist changes their name you must update every copy, and missing one causes inconsistent data (an update anomaly). Storing it once and referencing it with a key avoids that.' }
  },
  terms:[
    { id:'sql1-t1', term:'Table', def:'A named collection of [[rows]] and [[columns]] where each row is one record of the {{same kind of thing}}.' },
    { id:'sql1-t2', term:'Primary key', def:'A column or set of columns whose value [[uniquely]] identifies each row; it can never be [[NULL]].' },
    { id:'sql1-t3', term:'Foreign key', def:'A column that [[references]] a key of [[another table]] (usually its primary key).' },
    { id:'sql1-t4', term:'Declarative language', def:'A language where you describe {{[[what]] result you want, not [[how]] to compute it}}; the database\'s [[query planner]] chooses the steps.' },
    { id:'sql1-t5', term:'Schema', def:'The [[structure]] of a database: its tables, columns, [[data types]] and constraints.' }
  ],
  code:[
    { id:'sql1-c1', task:'Show every song\'s title and its duration in seconds.', lang:'sql', code:'SELECT [[title]], duration_sec\n[[FROM]] songs;' },
    { id:'sql1-c2', task:'Show each title with its duration converted to minutes, named duration_min.', lang:'sql', code:'SELECT title,\n       duration_sec / 60.0 [[AS]] duration_min\nFROM [[songs]];' },
    { id:'sql1-c3', task:'Return every column of the artists table.', lang:'sql', code:'SELECT [[*]]\n[[FROM]] artists;' }
  ],
  problems:[
    { id:'sql1-p1', kind:'sql', title:'Song directory',
      scenario:'The product team is building a song page. They need every song\'s title and genre, nothing else. Write the query.',
      hint:'Two columns, one table. No filtering needed.',
      solution:'SELECT title, genre\nFROM songs;',
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
    q:{ q:'A teammate writes WHERE genre <> \'Afrobeats\' on songs to get "all non-Afrobeats songs". Which song goes missing, and why?', a:'waf. Its genre is NULL (not tagged yet), and NULL <> \'Afrobeats\' is UNKNOWN, not TRUE, so WHERE drops the row. Write WHERE genre <> \'Afrobeats\' OR genre IS NULL to keep it.' }
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
    { id:'sql2-c2', task:'Find songs whose genre is missing.', lang:'sql', code:'SELECT title\nFROM songs\nWHERE genre [[IS NULL]];' },
    { id:'sql2-c3', task:'Show the top 5 positions on 2026-10-17.', lang:'sql', code:'SELECT chart_date, position, song_id\nFROM chart_entries\nWHERE chart_date = \'2026-10-17\'\n  [[AND]] position [[<=]] 5;' },
    { id:'sql2-c4', task:'Find songs in either the Hip-hop or the Alternative genre.', lang:'sql', code:'SELECT title\nFROM songs\nWHERE genre [[IN]] (\'Hip-hop\', \'Alternative\');' }
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
    { id:'sql3-c2', task:'List each song genre once.', lang:'sql', code:'SELECT [[DISTINCT]] genre\nFROM songs;' },
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
      '<code>GROUP BY artist_id</code> makes one group per distinct artist_id. The safe rule: put every column in SELECT either <b>in the GROUP BY</b> or <b>inside an aggregate</b>. Any other column can have many different values inside one group, and nothing says which one to show. Standard SQL does allow one more case: a column that is <b>functionally dependent</b> on the grouped columns, meaning it has exactly one value for each group. For example, Postgres accepts <code>artists.name</code> when you group by <code>artists.artist_id</code>, because artist_id is the primary key of artists. SQLite is more lenient than the standard: it runs any such query and shows the value from an arbitrary row of the group, without an error. Following the safe rule gives correct results on every engine.',
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
    { id:'sql4-c4', task:'Number of songs per genre, biggest genre first.', lang:'sql', code:'SELECT genre, COUNT(*) AS n_songs\nFROM songs\nGROUP BY [[genre]]\nORDER BY n_songs [[DESC]];' }
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
{ id:'sqlt', title:'What\'s inside a table', added:8,
  theory:{
    why:'Before you can connect tables you must be able to read one, and to decide what belongs in it. If you cannot say why <code>artist_id</code> sits in <code>songs</code> while <code>position</code> sits in <code>chart_entries</code>, every new database (a shop, a hospital, a bank) will look like a pile of random columns. One question sorts almost every column: <i>what does this fact describe?</i>',
    body:[
      '<b>The parts of a table.</b> A table has a <b>name</b> (<code>songs</code>) that says what kind of thing each row is. A <b>column</b> is one named field, read downwards (<code>title</code>). A <b>row</b> (record) is one thing, read across (one song). A <b>cell</b> is the single value where one row meets one column (163 is the duration of Goodbye). Every column has a <b>data type</b> (INTEGER, TEXT, DATE), and every cell in it must fit that type. (Most databases enforce this. SQLite, the engine inside this app, is lenient and stores a mismatched value anyway unless the table is declared STRICT, so do not rely on it to catch type mistakes.) The <b>primary key</b> (<code>song_id</code>) is unique on every row and never NULL. (SQLite footnote: because of a bug in early versions, SQLite accepts NULL in a primary-key column unless the column is an <code>INTEGER PRIMARY KEY</code>, the table is <code>WITHOUT ROWID</code> or <code>STRICT</code>, or the column is also declared <code>NOT NULL</code>. Postgres and DuckDB always reject it. So in SQLite write <code>PRIMARY KEY NOT NULL</code> for text keys.) A <b>foreign key</b> (<code>artist_id</code>) holds another table\'s primary key, so its values may repeat. The list of tables, columns, types and keys is the <b>schema</b>: the blueprint, not the data.',
      '<b>Grain: what one row stands for.</b> Say it out loud before you add a column. <code>artists</code>: one row = one artist. <code>songs</code>: one row = one song. <code>chart_entries</code>: one row = one song on one chart day. <code>streams</code>: one row = one play.',
      '<b>Where does a column belong?</b> Ask what the fact describes. A fact about the artist (the name) goes in <code>artists</code>. A fact about the song (title, duration, its main genre) goes in <code>songs</code>. A fact that exists <b>only because something happened</b> (position 1 on 17 October, 108,000 streams that day) is not a fact about the song: it is a fact about that song <i>on that day</i>, so it goes in the event table <code>chart_entries</code>, one new row per day. If you put <code>position</code> in <code>songs</code>, each day would overwrite the last and the history would be lost.',
      '<b>One value per cell: the "more than one?" test.</b> Before you put a fact on a table, ask: <i>can this fact have more than one value for one of these things?</i> If yes, it cannot be one column on that table. An artist can have several genres (Ayra Starr is described as Afrobeats and R&B). As a column on <code>artists</code> you would need either a list in one cell ("Afrobeats, R&B"), which cannot be filtered, counted or joined reliably, or a second Ayra Starr row, which copies her name and makes <code>artist_id</code> no longer unique. So genre is not an artist column. In our data each song carries one main genre, so <code>genre</code> lives in <code>songs</code>. If a song could have several genres too, you would add a table <code>song_genres(song_id, genre)</code> with one row per pair. The rule "every cell holds one value" is called <b>first normal form</b> (1NF); you will meet the other normal forms in data modelling. The test also catches other names: an artist has one <b>main</b> stage name (<code>artists.name</code>), but can also be known by several others (Wizkid is also called Starboy), so those go in <code>artist_aliases(artist_id, alias)</code>, one row per name. Featured artists work the same way: a song has one main artist in <code>songs.artist_id</code>, and any featured artists go in a linking table <code>song_artists(song_id, artist_id)</code>. The same test works anywhere: a product in several categories needs <code>product_categories</code>, and a student with several phone numbers needs <code>student_phones</code>.',
      '<b>The wide-table trap.</b> One wide table with the song\'s title, genre and artist name written on every chart row repeats facts (<b>redundancy</b>). If the artist changes their main stage name, every copy must change; miss one and the data disagrees. Splitting into <code>artists</code>, <code>songs</code> and <code>chart_entries</code> stores each fact once.',
      '<b>Where does the ID go?</b> On the <b>many</b> side. A song has one main artist and an artist has many songs, so each song row holds one <code>artist_id</code>. The other way round, <code>artists</code> would need a list of song IDs in one cell, which cannot be checked or joined. An <b>event</b> row (a chart entry, a stream, an appointment, an order) holds the IDs of <b>everything involved</b>: who, what, and when. When both sides are "many" (playlists and songs), the IDs go in a <b>linking table</b> with one row per pair.',
      '<b>It works on any data.</b> In a shop, <code>email</code> describes the customer, so it goes in <code>customers</code>, and <code>price</code> describes the product, so it goes in <code>products</code>. <code>quantity</code> exists only because a product was put on an order, so it goes in <code>order_items</code>, and <code>customer_id</code> goes in <code>orders</code> because one customer has many orders. In a hospital, an appointment time exists only because the appointment happened, so it goes in <code>appointments</code>, which holds <code>patient_id</code> and <code>doctor_id</code>. In a school, a grade describes one student in one course, so it goes in <code>enrolments</code>. In a bank, each deposit or withdrawal is an event, stored as one row in <code>transactions</code> with its <code>account_id</code>.'
    ],
    pro:'"Before I add a column I state the table\'s grain and ask what the fact describes. Entity attributes live on the entity table, facts that exist only because of an event live on the event table, and the foreign key goes on the many side."',
    q:{ q:'A shop\'s products table has a column quantity_sold_today. What is wrong with it, and where should that fact live?', a:'It is not a fact about the product: it exists only because orders happened today, and it would be overwritten every day (losing history). Store each sale as rows in order_items (order_id, product_id, quantity) and compute "sold today" with a query: SUM(quantity) for today\'s orders, grouped by product_id.' }
  },
  terms:[
    { id:'sqlt-t1', term:'Cell', def:'The single [[value]] where [[one row]] meets [[one column]].' },
    { id:'sqlt-t2', term:'Data type', def:'The [[kind of value]] a column may hold, such as INTEGER, TEXT or DATE; every value in that column must [[fit it]].' },
    { id:'sqlt-t3', term:'Redundancy', def:'The same fact stored in [[more than one place]], so every change must be made [[in every copy]].' }
  ],
  code:[
    { id:'sqlt-c1', task:'Ask the database for the blueprint (schema) of songs: each column\'s name, data type and whether it is the primary key.', lang:'sql', code:'SELECT [[name]], [[type]], pk\nFROM pragma_table_info(\'songs\');' },
    { id:'sqlt-c2', task:'Grain check: one row of chart_entries is one song on one chart day. Show every row for song 1 (Heaven Baby).', lang:'sql', code:'SELECT chart_date, position\nFROM [[chart_entries]]\nWHERE [[song_id]] = 1;' },
    { id:'sqlt-c3', task:'Read one cell: the duration of Calm Down (one row, one column).', lang:'sql', code:'SELECT [[duration_sec]]\nFROM songs\nWHERE [[title]] = \'Calm Down\';' }
  ],
  problems:[
    { id:'sqlt-p1', kind:'sql', ordered:true, title:'Prove the grain',
      scenario:'chart_entries is meant to hold one row per song per chart day (the top 10). Return each chart_date and how many rows it has (call it songs_on_chart), oldest date first.',
      hint:'GROUP BY chart_date and COUNT(*). If the grain is right, every day shows 10.',
      solution:'SELECT chart_date, COUNT(*) AS songs_on_chart\nFROM chart_entries\nGROUP BY chart_date\nORDER BY chart_date;',
      explain:'Each day has exactly 10 rows: one per charting song. That is the grain. Position and streams live here, not in songs, because they exist only because of that day\'s chart. Heaven Baby appears on three days as three rows, and its title and duration are still stored once, in songs.' }
  ]
},
{ id:'sqlr', title:'Entities, events & relationships', added:7,
  theory:{
    why:'Joins only make sense once you know <i>why</i> data is split into tables and <i>what</i> links them. If <code>songs.artist_id = artists.artist_id</code> looks like magic syntax, you will guess at joins. If you can see "a song belongs to an artist" and "a stream links a listener to a song", you know which table connects to which, and which pairs cannot be connected at all.',
    body:[
      'One big table repeats facts: the artist\'s name and the label the artist is currently signed to are copied onto every song. Change a label and you must update every copy, and if you miss one the data disagrees with itself. Mistype a name once ("Burna Boi") and you have invented a new artist. So we <b>split</b> the data so that each fact is stored <b>once</b>, in the table it describes.',
      '<b>Entity</b>: a thing that exists on its own and that we store facts about, such as an artist, a song or a listener. Each entity gets its own table and its own ID (the primary key).',
      '<b>State</b>: a current, changeable fact about an entity, such as an artist\'s current label or a listener\'s current city. It is usually a column on that entity\'s table. (A song\'s chart position is not state: it belongs to one day\'s chart, so it is stored as an event row in chart_entries. See "What\'s inside a table".) An UPDATE overwrites it, so the old value is lost unless you keep history on purpose (a history table, or a slowly changing dimension later in the course).',
      '<b>Event</b>: something that happened at a moment, such as "Ada streamed Calm Down at 21:14". It did not exist until it happened. Each event is a <b>new row</b> holding a timestamp and the IDs of the entities involved (listener_id, song_id), and in normal use the row is not edited afterwards. When an event row is wrong, it is fixed deliberately: by a new correcting row (for example a reversal), or by a controlled, logged update. Events can also arrive late, and are added when they arrive.',
      '<b>Relationship</b>: how entities connect. Some relationships are facts stored as a foreign key: each song points at its main artist (<code>songs.artist_id</code> holds a value of <code>artists.artist_id</code>). Featured artists are a separate many-to-many relationship with its own linking table. Others are <b>created by events</b>: a listener and a song have no link until a stream happens, and the stream row <i>is</i> the link. Entities exist first. Events, and the links they create, come later.',
      'There are three kinds of relationship. <b>One-to-many</b>: an artist has many songs, and the foreign key sits on the "many" side. <b>One-to-one</b>: an artist has one profile. <b>Many-to-many</b>: listeners and songs, or songs and playlists. A many-to-many relationship needs a <b>linking (junction) table</b> that holds pairs of IDs. An <b>ERD</b> (entity-relationship diagram) draws the tables as boxes and the relationships as lines between their keys.',
      'Tables connect only through <b>shared IDs</b>. listeners and artists share no column, so you cannot join them directly. Instead you follow the foreign keys: from listeners to streams (on listener_id), from streams to songs (on song_id), and from songs to artists (on artist_id). If no shared ID, event table or linking table connects two tables, a join between them has no meaning.'
    ],
    pro:'"I start from the ERD. Entities like artists and songs are linked by foreign keys. Events like streams are rows that carry the listener\'s and the song\'s IDs, so that is the path I join along."',
    q:{ q:'You need each listener\'s favourite artist, but listeners and artists share no column. Is it possible, and how?', a:'Yes, by following the relationships: join listeners to streams on listener_id, streams to songs on song_id, and songs to artists on artist_id. The stream events connect listeners to songs, and songs.artist_id connects songs to artists. Count streams per listener and artist, then keep the top one for each listener.' }
  },
  terms:[
    { id:'sqlr-t1', term:'Entity', def:'A [[thing]] that exists on its own and that we store facts about, with its own [[table]] and [[ID]].' },
    { id:'sqlr-t2', term:'State', def:'A [[current]], changeable fact about an entity, usually a column. An UPDATE [[overwrites]] the old value.' },
    { id:'sqlr-t3', term:'Event (data modelling)', def:'Something that [[happened]] at a moment. It is stored as a [[new row]] with a timestamp and the IDs involved, and is normally not edited.' },
    { id:'sqlr-t4', term:'Relationship', def:'How entities [[connect]]: either a fact stored as a [[foreign key]], or a link [[created by events]].' },
    { id:'sqlr-t5', term:'One-to-many', def:'One row on one side matches [[many]] rows on the other. The foreign key sits on the [[many side]].' },
    { id:'sqlr-t6', term:'ERD', def:'An [[entity-relationship diagram]]: tables drawn as [[boxes]] and relationships as [[lines]] between their keys.' }
  ],
  code:[
    { id:'sqlr-c1', task:'Follow the arrow by hand. Song 14 (Calm Down) has artist_id 14. Look up that artist\'s name.', lang:'sql', code:'SELECT name\nFROM [[artists]]\nWHERE [[artist_id]] = 14;' },
    { id:'sqlr-c2', task:'One-to-many: list every song that belongs to artist 1 (Ayra Starr).', lang:'sql', code:'SELECT title\nFROM songs\nWHERE [[artist_id]] = 1;' },
    { id:'sqlr-c3', task:'Events: list listener 1\'s streams, oldest first.', lang:'sql', code:'SELECT song_id, streamed_at\nFROM [[streams]]\nWHERE listener_id = 1\nORDER BY [[streamed_at]];' }
  ],
  problems:[
    { id:'sqlr-p1', kind:'sql', ordered:true, title:'Count the events',
      scenario:'streams is an event table with one row per play. Return each song_id and its number of plays (call it plays), most played first, with ties broken by song_id.',
      hint:'One row per event, so COUNT(*) per song_id counts the plays.',
      solution:'SELECT song_id, COUNT(*) AS plays\nFROM streams\nGROUP BY song_id\nORDER BY plays DESC, song_id;',
      explain:'Every play is a new row, so counting rows counts events. Song 14 (Calm Down) has 4 plays: Ada played it twice, and each play is its own row. That is the difference between an event (a new row each time) and state (one value that gets overwritten).' }
  ]
},
{ id:'sql5', title:'JOINs',
  theory:{
    why:'Good database design <b>normalizes</b> data: artists, songs and chart entries live in separate tables so each fact is stored once. Questions, though, cut across tables ("which <i>artist</i> had the most <i>streams</i>?"). A JOIN puts the pieces back together at query time by matching keys.',
    body:[
      'A join <b>follows the arrow</b> you met in <i>Entities, events & relationships</i>: a foreign key (<code>songs.artist_id</code>) points at a primary key (<code>artists.artist_id</code>), and the join brings the related rows back together. Look at the ERD first, and join only along its lines.',
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

{ id:'sqlm', title:'Many-to-many: two joins', added:7,
  theory:{
    why:'Listeners stream many songs, and each song is streamed by many listeners. No single foreign key can hold that, because a column holds one value per row. The answer is a linking table (streams, playlist_songs) with one row per pair, plus a query that joins through it twice.',
    body:[
      '<b>Many-to-many</b>: each row on either side can relate to many rows on the other. You cannot store this as a column in either table: a <code>listeners.song_id</code> column could hold only one song.',
      'A <b>linking table</b> (also called a junction, bridge or associative table) has one row per pair, for example <code>playlist_songs(playlist_id, song_id)</code>. Its primary key is often the pair itself, so the same song cannot be added to the same playlist twice. When the link is an <b>event</b> (streams), the table also has a timestamp, and the same pair can repeat: Ada can stream Calm Down twice.',
      'Query it with <b>two joins</b>, starting from the linking table: <code>FROM streams st JOIN listeners l ON l.listener_id = st.listener_id JOIN songs s ON s.song_id = st.song_id</code>. Each join follows one arrow in the ERD.',
      'Grain: the result has one row per linking row (one per stream), not one per listener. Keep that in mind when you count or aggregate. INNER JOINs drop listeners with no streams. To keep them, start FROM listeners and use LEFT JOINs.'
    ],
    pro:'"listeners and songs are many-to-many, so I joined through the streams fact table (one row per play): streams to listeners on listener_id, and streams to songs on song_id. Then I aggregated at the grain I needed."',
    q:{ q:'A product manager wants to add a song_ids column to playlists holding text like "10,12,14". Why is that a bad idea, and what would you do instead?', a:'A comma-separated list breaks keys and joins. You cannot join on it, you cannot enforce that each ID exists or stop duplicates, and changing one song means rewriting the text. Use a linking table, playlist_songs(playlist_id, song_id), with one row per pair and a composite primary key.' }
  },
  terms:[
    { id:'sqlm-t1', term:'Many-to-many relationship', def:'Each row on [[either side]] can relate to [[many]] rows on the other, so it needs a [[linking table]].' },
    { id:'sqlm-t2', term:'Junction (linking) table', def:'A table with [[one row per pair]] of related IDs, where each ID is a [[foreign key]] to one side.' }
  ],
  code:[
    { id:'sqlm-c1', task:'Show each stream as the listener\'s name and the song title (two joins).', lang:'sql', code:'SELECT l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.[[listener_id]]\nJOIN [[songs]] s ON s.song_id = st.song_id;' },
    { id:'sqlm-c2', task:'List the songs on the playlist Naija Hits.', lang:'sql', code:'SELECT s.title\nFROM playlist_songs ps\nJOIN playlists p ON p.playlist_id = ps.[[playlist_id]]\nJOIN songs s ON s.song_id = ps.[[song_id]]\nWHERE p.name = \'Naija Hits\';' },
    { id:'sqlm-c3', task:'How many different listeners streamed each song?', lang:'sql', code:'SELECT s.title, COUNT([[DISTINCT]] st.listener_id) AS listeners\nFROM streams st\nJOIN songs s ON s.song_id = st.song_id\n[[GROUP BY]] s.title;' }
  ],
  problems:[
    { id:'sqlm-p1', kind:'sql', title:'Who listens to which artist',
      scenario:'For each listener and artist, return the listener\'s name (call it listener), the artist\'s name (artist) and the number of streams (plays). listeners and artists share no column, so follow the arrows.',
      hint:'streams → listeners on listener_id, streams → songs on song_id, songs → artists on artist_id. Then GROUP BY listener and artist.',
      solution:'SELECT l.name AS listener, a.name AS artist, COUNT(*) AS plays\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s     ON s.song_id = st.song_id\nJOIN artists a   ON a.artist_id = s.artist_id\nGROUP BY l.name, a.name;',
      explain:'The listener–artist link is not stored anywhere. It exists only because of stream events plus the foreign key from each song to its main artist (songs.artist_id). The row for Ada and Rema shows 2 plays because she streamed Calm Down twice. Zainab is missing: she has no stream events, so she has no link to any artist.' }
  ]
},
{ id:'sqlc', title:'Joins in combination', added:10, rung:2,
  theory:{
    why:'Real questions combine a join with a count, a filter or a second join. Each piece is simple on its own; the mistakes happen where they meet, usually because the join changed the number of rows before something counted or added them up.',
    body:[
      'Before writing a query, decide what <b>one result row</b> stands for (the grain): one listener, one stream, one customer. Then check what one row stands for <b>after each join</b>.',
      'Joining from the many side to the one side (streams to listeners) keeps one row per many-side row. Joining from the one side to the many side repeats each one-side row once per match (<b>fan-out</b>).',
      '<code>COUNT(*)</code> counts rows. <code>COUNT(DISTINCT x)</code> counts different values of x. After a fan-out these can differ, so choose the one that matches the question.',
      'A <code>SUM</code> over a column of the one side (an order total) after joining to its many side (order items) adds that value once per matching row. Sum before joining, or do not join the table you do not need.'
    ],
    pro:'"Before I aggregate, I check the grain after every join. If a join to a child table repeats the parent rows, I sum at the parent level first or drop the join."',
    q:{ q:'A report sums orders.total after joining orders to order_items, and the totals are too high. Explain the cause and the fix.', a:'Each order is repeated once per item, so its total is added once per item. Sum the totals without the order_items join (or aggregate items in a subquery first and then join one row per order).' }
  },
  terms:[], code:[], problems:[]
},
{ id:'sqlrt', title:'Real task: the shop’s best customers', added:10, rung:3,
  theory:{
    why:'At work a request arrives as one sentence, not as a list of SQL clauses. Turning the sentence into a short plan first (grain, tables, filter, test) and then building the query one piece at a time, checking the rows after each piece, is how analysts avoid wrong answers that look right.',
    body:[
      'Plan with four questions: <b>What is one result row?</b> <b>Which tables hold the facts?</b> <b>Which rows count?</b> (WHERE) <b>Which test picks the groups?</b> (HAVING).',
      'Build in this order and look at the rows each time: filter the rows, group and count, keep the groups that pass the test, then join in names for the people reading the result.',
      'Use a half-open range for dates: <code>order_date &gt;= \'2026-10-01\' AND order_date &lt; \'2026-11-01\'</code>. It includes every moment of October and nothing of November, whether the column holds dates or date-times.',
      '“More than two” is <code>&gt; 2</code>, not <code>&gt;= 2</code>. A count belongs to a group, so a test on <code>COUNT(*)</code> goes in HAVING; WHERE runs on single rows before groups exist.'
    ],
    pro:'"I restated the request as a grain (one customer), a filter (October orders), a group (customer_id) and a test (COUNT(*) > 2), built it step by step and checked the counts at each step."',
    q:{ q:'Which artists had a song in the top 5 on more than one chart day? Describe the plan before writing SQL.', a:'One row per artist. Tables: chart_entries (positions and days), songs (to reach the artist) and artists (names). Filter: position <= 5. Group by artist. Test: COUNT(DISTINCT chart_date) > 1, because an artist with two top-5 songs on the same day has two entries for one day.' }
  },
  terms:[], code:[],
  problems:[
    { id:'sqlrt-p1', kind:'sql', title:'Top-5 artists on more than one day',
      scenario:'Which artists had a song in the top 5 of the chart on more than one chart day? Return the artist name (artist) and the number of different days (days). Plan first: one row per artist; a top-5 entry is position <= 5.',
      hint:'chart_entries → songs on song_id → artists on artist_id. WHERE c.position <= 5. GROUP BY the artist. HAVING COUNT(DISTINCT c.chart_date) > 1: an artist with two top-5 songs on one day has two entries for one day.',
      solution:'SELECT a.name AS artist, COUNT(DISTINCT c.chart_date) AS days\nFROM chart_entries c\nJOIN songs s   ON s.song_id = c.song_id\nJOIN artists a ON a.artist_id = s.artist_id\nWHERE c.position <= 5\nGROUP BY a.artist_id, a.name\nHAVING COUNT(DISTINCT c.chart_date) > 1;',
      explain:'One row per artist, counted in days, not in entries. COUNT(*) would count chart entries: an artist with two songs in the top 5 on the same day would get 2 for a single day and pass the test wrongly.' }
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
    { id:'sql7-t4', term:'UNION ALL vs UNION', def:'UNION ALL stacks rows and [[keeps duplicates]]; UNION also [[removes duplicates]], which usually makes it slower.' }
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
    { id:'sql8-t3', term:'LAG', def:'Returns a value from a [[previous row]] in the window\'s order, such as yesterday\'s chart position; it returns [[NULL]] when there is no previous row (unless you give a default).' },
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
      explain:'This is one of the most common data engineering interview SQL patterns. PARTITION BY the <b>business key</b>, ORDER BY a recency column, and keep row 1. Use ROW_NUMBER, not RANK: if two rows had the same loaded_at, RANK would keep both. (ROW_NUMBER would then pick one of them arbitrarily, so add a tie-breaker column to the ORDER BY when ties are possible.)' }
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
      '<b>Integer division</b>: <code>7 / 2</code> is 3 in SQLite, Postgres and SQL Server. Multiply by <code>1.0</code> or CAST to a decimal type first. Not every engine does this: in DuckDB (your pipeline) and MySQL, <code>7 / 2</code> is 3.5, and DuckDB uses <code>//</code> for integer division. Check the engine you are on.',
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
      'Layers are often named <b>raw</b>, <b>staging</b> and <b>marts</b> (or bronze, silver and gold). Data flows through them in that order: the raw layer is untouched, staging is cleaned, and marts are business-ready.'
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
    { id:'etl2-t1', term:'Idempotency', def:'An operation is idempotent when [[running it once or many times]] gives the [[same end result]], so a pipeline can be safely retried after a failure without creating [[duplicate data]].' },
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
      code:'last = get_watermark("chart_entries")   # e.g. "2026-10-16"\nnew_rows = [r for r in rows if r["chart_date"] [[>]] last]\nif new_rows:   # nothing new: keep the old watermark\n    load(new_rows)\n    set_watermark("chart_entries", [[max]](r["chart_date"] for r in new_rows))' }
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
      'Common <b>data-quality checks</b>: <b>not null</b> (titles exist), <b>unique</b> (one row per chart_date + song), <b>accepted values or ranges</b> (position between 1 and 100), <b>referential integrity</b> (every song_id exists in songs), <b>volume</b> (100 rows per day in your data, not 3), and <b>freshness</b> (today\'s data has arrived).',
      '<b>Schema drift</b>: the source changes shape, for example Deezer renames a field. Validate the fields you depend on during extract and transform, so the job fails with a clear message instead of loading NULLs.',
      '<b>Unit tests</b> (pytest) check one function with known input and expected output, such as "transform drops duplicate tracks". Teams usually run them in CI on every push. Your project has <code>tests/test_transform.py</code>, and your workflow runs it before each pipeline run.',
      'Where checks run: in Python before load (your transform refuses duplicates or missing titles), as SQL queries that should return zero rows, or as dbt tests (<code>unique</code>, <code>not_null</code>) after load.'
    ],
    pro:'"I treat data-quality checks as assertions: a SQL check that should return zero rows, or a Python assert in the transform. If one fails, the run fails before the bad data is published."',
    q:{ q:'Your job loaded 3 rows today instead of the usual 100, and all values look valid. Which check would catch it?', a:'A volume (row-count) check, for example "fail if today\'s count is under 90". Not-null and unique checks pass on 3 perfectly valid rows. Volume and freshness checks catch silent partial loads.' }
  },
  terms:[
    { id:'etl4-t1', term:'Data-quality check', def:'An automated [[assertion]] about data, such as no NULLs or unique keys, that [[stops or flags]] the pipeline when it fails.' },
    { id:'etl4-t2', term:'Freshness check', def:'Verifies how [[recent]] the latest data is, e.g. today\'s chart [[arrived]] on time.' },
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
      '<b>Architecture in one breath</b>: GitHub Actions starts the job on a daily cron schedule. <code>extract.py</code> calls the Deezer API and saves the raw JSON for that date. <code>transform.py</code> flattens and validates it, and <code>load.py</code> deletes that date\'s rows in DuckDB and inserts the new ones. Finally, SQL views are built on top: chart_movement (with LAG) and artist_summary.',
      'A <b>partition</b> is the slice of a table whose rows share one value of a column such as the date. In your DuckDB table it is a <b>logical</b> slice: the rows <code>WHERE chart_date = </code> that day, inside one table. Warehouses such as BigQuery can also store each partition <b>physically</b> apart, so a query that filters on the date reads only that part (partition pruning). Your load deletes and re-inserts exactly one date\'s rows, which makes it idempotent and cheap.',
      '<b>Data lineage</b>: you can trace each number in a view back to the table row it came from, then to the clean row, and finally to the raw JSON. <b>Logging</b> row counts each run (your load prints them) is the first step toward <b>observability</b>.',
      '<b>Scaling story</b>: move from DuckDB to BigQuery (its free tier is enough to start), turn the SQL views into dbt models with tests, replace GitHub Actions with Airflow once there are many dependent tasks (Module 5), and add alerting when a check fails.'
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
      solution:'Problem: Deezer only shows today\'s Top Nigeria chart, so there\'s no history to see which songs are climbing.\n\nArchitecture: a daily GitHub Actions cron runs a Python pipeline. extract.py calls the Deezer API with pagination and saves the raw JSON per date. transform.py flattens the tracks and enforces quality rules (no duplicate tracks, no missing titles). load.py writes to DuckDB.\n\nDecision: I made the load idempotent by deleting and re-inserting the run date\'s partition, so retries and backfills can\'t double-count. I keep the raw JSON so I can replay history if the logic changes.\n\nResult: SQL views use LAG to compute daily movement and rank artists. For example, FOLA had 9 songs on the 17 October 2026 chart. Unit tests run with pytest.\n\nNext: move to BigQuery and dbt with not_null and unique tests, and add alerting when a check fails.',
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
      '<b>The flow</b>: GitHub Actions (<code>cron: "17 7 * * *"</code>) runs <code>run_pipeline.py</code>, which calls four functions in order. <code>extract()</code> saves <code>data/raw/top_nigeria_&lt;date&gt;.json</code>, <code>clean_rows()</code> turns it into a list of dicts, <code>load()</code> writes them to the table <code>chart_entries</code> in <code>data/charts.duckdb</code>, and <code>build_models()</code> runs <code>sql/*.sql</code> to create the views <code>chart_movement</code> and <code>artist_summary</code>. Then the workflow commits <code>data/</code> back to the repo.',
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
    { id:'pj1-q1', q:'What breaks if the Deezer API is down when the scheduled run starts?', a:'raise_for_status() raises, run_pipeline.py stops and the GitHub Actions job [[fails]] before anything is loaded. Nothing is committed, so that day is [[missing]] unless you re-run it with workflow_dispatch [[before the chart updates]], because the API only serves today\'s chart.' },
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
      scenario:'Deezer sometimes answers <b>429 Too Many Requests</b>. Change extract so it tries a request up to 3 times (the first try plus 2 retries) with an increasing pause between tries, but still fails loudly on other errors. Write the helper and show where it goes in the loop.',
      hint:'Check resp.status_code. Sleep longer each attempt (back-off). Keep raise_for_status for everything else.',
      solution:`import time

def get_with_retry(url, attempts=3, wait=5):
    for i in range(attempts):        # 3 tries = 1 try + 2 retries
        resp = requests.get(url, timeout=30)
        if resp.status_code != 429:
            resp.raise_for_status()
            return resp.json()
        if i < attempts - 1:
            time.sleep(wait * (i + 1))   # back off before the next try: 5s, then 10s
    resp.raise_for_status()          # still 429 after 3 tries -> fail loudly

# in extract(), replace the three request lines with:
#     body = get_with_retry(url)`,
      explain:'Only retry errors that are <b>transient</b> (429, and often 502/503). A 404 won\'t fix itself. <b>Back-off</b> stops you hammering a struggling server. The final <code>raise_for_status()</code> keeps the fail-loudly principle. Airflow and similar tools give you task-level retries like this for free. (Your real extract.py has no retry yet; this exercise adds one.)' }
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
    { id:'pj3-q1', q:'What breaks if you remove the duplicate-tracks assert and Deezer sends a track twice?', a:'The duplicate reaches load.py after the DELETE has run. The [[primary key]] then rejects it with a [[ConstraintException]] partway through executemany (checked on DuckDB 2.0: the rows before the duplicate stay), so that day is left [[incomplete]] in the warehouse. The assert fails earlier, before anything is touched.' },
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
    { id:'pj4-t5', term:'DuckDB', def:'An [[in-process]] analytical SQL database, usually stored in a [[single file]] (or kept in memory), with no server to run.' },
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
    { id:'pj4-q3', q:'What breaks if transform adds a 10th key like "genre" to each row?', a:'tuple(r.values()) now has [[10 values]] for [[9 placeholders]], so executemany raises InvalidInputException. The DELETE has already run, so that day is [[emptied]]. The DDL, the placeholders and a migration must change together.' },
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
      '<code>CREATE OR REPLACE VIEW</code> (supported by DuckDB, Postgres and others) creates the view or overwrites its definition, so editing a .sql file takes effect on the next run. A view stores the <i>query</i>, not data. SQLite (the engine in this app) has no OR REPLACE, so the app runs <code>DROP VIEW IF EXISTS</code> + <code>CREATE VIEW</code> instead.',
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
    { id:'pj5-t2', term:'CREATE OR REPLACE VIEW', def:'SQL syntax in DuckDB and Postgres that creates a view or [[overwrites]] its definition, so re-running the SQL file is [[idempotent]].' },
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
      'Steps run <b>in order</b>, and a failing step stops the job. First <code>actions/checkout@v4</code> checks out the repo and <code>actions/setup-python@v5</code> installs Python 3.12. Then <code>pip install -r requirements.txt</code> installs the libraries, <code>pytest -q</code> runs the tests (the <b>gate</b>), <code>python run_pipeline.py</code> runs the pipeline, and the last step, "Commit new data", saves the result.',
      '<b>Commit step</b>: set a bot identity, <code>git add data/</code>, then <code>git diff --cached --quiet || git commit -m "data: chart for $(date -u +%F)"</code>. <code>diff --cached --quiet</code> exits 0 when nothing is staged, so the commit is skipped instead of failing. <code>$(date -u +%F)</code> is today\'s date as YYYY-MM-DD in UTC. Then <code>git push</code>.',
      'Trade-offs: every data commit stores a new full copy of the DuckDB file, because Git cannot store just the changed rows of a binary file. In your repo the file alternates between about 0.8 MB and 1.3 MB; Git compresses each copy, and so far each one has added roughly 10 to 100 KB to the history. That is small today, but the history only ever grows. Also, in public repos GitHub disables scheduled workflows after 60 days with no repository activity. GitHub does not define "activity" precisely, but in practice your daily data commits count, so the risk is a stretch with no commits, for example while the job keeps failing. Finally, the schedule says 07:17 UTC, but GitHub starts scheduled runs late when it is busy: your data commits so far landed between about 12:00 and 14:45 UTC.'
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
      explain:'"waf" fell 5 places (3 → 8) and "SLICK" fell 2 (2 → 4). "Goodbye (Warm Up)" and "Owo Oluwa" tie at −1, so the title tie-breaker makes the order deterministic. <code>places_gained < 0</code> also excludes new entries automatically, because NULL < 0 is UNKNOWN, not TRUE.' },
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
    { id:'pj10-q1', q:'"Walk me through your pipeline."', a:'It\'s a daily [[batch ETL]] for the Deezer Top Nigeria chart. A [[GitHub Actions cron]] schedules run_pipeline.py for 07:17 UTC every day. extract.py follows the API\'s pagination and saves [[raw JSON]] per date, transform.py flattens the tracks and asserts quality rules, load.py does an [[idempotent]] delete-then-insert into DuckDB, and SQL views use [[LAG]] for chart movement. Tests run first, and the job commits the data back to the repo.' },
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
      scenario:'Interviewer: <i>"When today\'s scheduled run started, Deezer returned HTTP 500. What happens to today\'s data, and what do you do?"</i> Answer as you would out loud.',
      hint:'Trace the code: extract → raise_for_status → which steps run? What\'s in the warehouse? Then: immediate action and long-term fix.',
      solution:`What happens: requests.get gets a 500 and resp.raise_for_status() raises HTTPError inside extract(). run_pipeline.py stops (fail-fast), so transform, load and build_models never run, and the commit step never runs. The warehouse is unchanged and still correct up to yesterday. No partial data.

What I do: the failed run shows in the Actions tab. I re-run it with workflow_dispatch the same day, before Deezer updates the chart, because the API can't give me today's chart later. The load is idempotent, so re-running is safe.

Long-term: add retries with back-off for 5xx/429 inside extract, and an alert (e.g. a notification on workflow failure) so I don't rely on checking manually.`,
      explain:'A strong answer <b>traces the actual code path</b>, states the data impact ("no partial data"), gives the immediate action, and names a structural fix. That\'s the Point → Evidence → Trade-off → Improvement frame.' }
  ]
}
];

/* =====================================================================
   BITE-SIZE TERM DATA (v3)
   Long definitions are learned in small pieces. For each term id:
     bites:   the pieces, each copied word-for-word from the definition.
              Terms with long definitions that are not listed here are split
              automatically on commas / clause words (3-4 pieces).
     aspects: extra "different angle" questions, asked every few days:
              { q, o:[correct, wrong, wrong, wrong], t:[typed answers], why }
              o  -> multiple choice (first option is the right one; shuffled)
              t  -> once answered right with options, later asked without options
              { q, piece:N, why } -> "which piece explains this?" (options = the pieces)
   ===================================================================== */
const TERM_BITES = {
  'sql1-t1': { bites:['named collection of rows and columns','each row is one record','of the same kind of thing'] },
  'sql1-t2': { bites:['a column or set of columns','uniquely identifies each row','can never be NULL'],
    aspects:[{ q:'A users table has an email column. Two users signed up without an email (NULL). Can email be the primary key?', o:['No: a primary key must be unique and can never be NULL','Yes: keys ignore NULL values','Yes, as long as the other emails are unique','No: a primary key must be an integer'], why:'Two rules: unique AND never NULL. Missing emails break the second rule.' }] },
  'sql1-t4': { bites:['describe what result you want','not how to compute it','query planner chooses the steps'] },
  'sql2-t1': { bites:['a condition that evaluates','to TRUE, FALSE or UNKNOWN','WHERE keeps only rows where it is TRUE'] },
  'sql2-t2': { bites:['a marker meaning','a value is missing or unknown','not zero and not an empty string'],
    aspects:[{ q:'A chart row has streams = NULL. A teammate says "so it had 0 streams". What is wrong with that?', o:['NULL means missing or unknown, not zero','Nothing: NULL is stored as 0','NULL means the row was deleted','NULL means an empty string'], why:'Treating NULL as 0 silently changes averages and totals.' }] },
  'sql2-t3': { bites:['conditions can be TRUE, FALSE or UNKNOWN','any comparison with NULL yields UNKNOWN','you test for it with IS NULL'],
    aspects:[{ q:'WHERE genre = NULL returns no rows, even though the song waf has a NULL genre. Why?', o:['genre = NULL is UNKNOWN for every row, and WHERE keeps only TRUE rows','NULL rows are hidden by default','= only works on numbers','NULL must be written in quotes'], why:'Any comparison with NULL is UNKNOWN, never TRUE.' },
      { q:'What do you write instead of "= NULL" to find rows with a missing genre?', o:['IS NULL','== NULL','= \'\'','LIKE NULL'], t:['is null','where genre is null','genre is null'], why:'IS NULL is the only test that returns TRUE for a missing value.' }] },
  'sql3-t1': { bites:['sorts result rows by one or more expressions','ascending by default or DESC for descending','without it row order is not guaranteed'] },
  'sql3-t4': { bites:['the order SQL clauses are conceptually evaluated','FROM, WHERE, GROUP BY, HAVING','SELECT, ORDER BY, LIMIT'],
    aspects:[{ q:'Why can\'t WHERE use a column alias you defined in SELECT?', o:['WHERE is evaluated before SELECT, so the alias does not exist yet','Aliases only work in GROUP BY','WHERE is evaluated after ORDER BY','Aliases must be in double quotes'], why:'Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.' }] },
  'sql4-t2': { bites:['splits rows into groups','that share the same values in the listed columns','computes aggregates per group'] },
  'sql4-t4': { bites:['the level of detail','what one row represents','one song on one chart day'],
    aspects:[{ q:'chart_entries has one row per song per chart day. You join it to a table with one row per song per country. What happens?', o:['The grain changes: rows multiply and SUMs inflate','Nothing: joins never change the row count','Rows with NULL disappear','The query becomes declarative'], why:'Always state the grain before and after a join.' }] },
  'sql5-t1': { bites:['combines rows from two tables','by matching values in related columns','usually a foreign key to a primary key'] },
  'sql5-t3': { bites:['all rows from the left table','plus matching rows from the right','where there is no match','the right-side columns are NULL'],
    aspects:[{ q:'artists LEFT JOIN songs. Tems has no songs. What does her row show in s.title?', o:['NULL','Her row is dropped','An empty string','0'], t:['null'], why:'Left rows are kept; missing right-side columns are filled with NULL.' },
      { q:'Which piece explains why artists with no songs still appear in the result?', piece:0, why:'"All rows from the left table" is the promise a LEFT JOIN makes.' }] },
  'sql5-t4': { bites:['finds rows with no match','in another table','LEFT JOIN then WHERE the right key IS NULL'] },
  'sql8-t1': { bites:['computes a value across a set of related rows','while keeping every row in the result','defined with OVER()'],
    aspects:[{ q:'You need every chart row PLUS its artist\'s total streams on the same row. GROUP BY collapses the rows. What do you use?', o:['A window function: SUM(streams) OVER (PARTITION BY artist)','HAVING SUM(streams)','SELECT DISTINCT','A second GROUP BY'], why:'Window functions compute across related rows without collapsing them.' },
      { q:'Which piece explains how a window function differs from GROUP BY?', piece:1, why:'GROUP BY returns one row per group; a window keeps every row.' }] },
  'sql8-t2': { bites:['splits rows into independent groups','for a window function','like GROUP BY but without collapsing the rows'] },
  'sql8-t3': { bites:['a value from a previous row','in the window\'s order','such as yesterday\'s chart position','NULL when there is no previous row'],
    aspects:[{ q:'A song is on the chart for the first time today. What does LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date) return for it?', o:['NULL','0','Its current position','The position of the song above it'], t:['null'], why:'No previous row in its partition, so LAG returns NULL (that is how you detect new entries).' }] },
  'sql8-t4': { bites:['ROW_NUMBER gives unique numbers even for ties','RANK gives ties the same number and skips the next','DENSE_RANK gives ties the same number without gaps'],
    aspects:[{ q:'Scores 90, 90, 80. What does RANK() give the 80?', o:['3','2','1','4'], t:['3'], why:'RANK skips: 1, 1, 3. DENSE_RANK would give 2.' }] },
  'sql9-t5': { bites:['dividing two integers','discards the remainder','so 7 / 2 = 3','multiply by 1.0 to get decimals'] },
  'etl1-t4': { bites:['raw data is loaded first','then transformed inside the warehouse','usually with SQL tools like dbt'] },
  'etl1-t5': { bites:['storage for source data','exactly as received','the pipeline can be replayed','if the transform logic changes'],
    aspects:[{ q:'You find a bug in transform.py that mis-parsed last month\'s data. The API only serves today\'s chart. What saves you?', o:['The raw layer: re-run the transform on the saved raw responses','A longer request timeout','Dropping the warehouse table','Calling the API again for past dates'], why:'Raw data saved exactly as received can be replayed through fixed logic.' }] },
  'etl2-t1': { bites:['running it once or many times','gives the same end result','safely retried after a failure','without creating duplicate data'],
    aspects:[{ q:'A load script INSERTs today\'s rows. It fails halfway, the scheduler re-runs it, and every rerun adds duplicate rows. Is the load idempotent?', o:['No: running it again changes the end result (duplicates)','Yes: it uses the same input each time','Yes, because it eventually succeeds','No, because it is too slow'], t:['no'], why:'Idempotent = once or many times, same end result. Duplicates prove it is not.' },
      { q:'Which piece names the damage a non-idempotent rerun causes?', piece:3, why:'Without idempotency, retries create duplicate data.' },
      { q:'Name one load pattern that makes a daily load idempotent.', o:['Delete the run date\'s rows, then insert them (delete-then-insert)','INSERT without any key','Increase the retry count','Run it only once a week'], t:['delete-then-insert','delete then insert','upsert','merge','insert overwrite','overwrite the partition'], why:'Delete-then-insert, upsert/MERGE, or overwriting the partition all give the same end result on rerun.' }] },
  'etl2-t3': { bites:['loading only data','that is new or changed','since the last run','instead of a full refresh'],
    aspects:[{ q:'A nightly job reloads 3 years of orders (4 hours), but only yesterday\'s rows ever change. Best fix?', o:['An incremental load that resumes from a watermark','A full refresh twice a day','A bigger server','Stream every order through Kafka'], why:'Load only new or changed rows; the watermark remembers where you stopped.' }] },
  'etl2-t4': { bites:['the last processed value','such as a timestamp or ID','stored so the next run','knows where to resume'] },
  'etl2-t5': { bites:['re-running a pipeline for past dates','to fill gaps','or apply new logic to historical data'] },
  'etl3-t5': { bites:['events that reach the pipeline','after the time window they belong to','has already been processed'] },
  'etl4-t1': { bites:['an automated assertion about data','such as no NULLs or unique keys','stops or flags the pipeline','when it fails'],
    aspects:[{ q:'The API returns 3 rows today instead of the usual 100. The pipeline loads them and the dashboard looks empty. Which check would have caught it?', o:['A volume check on the row count','A unit test of the transform function','A freshness check (the data did arrive on time)','A schema drift check'], why:'The data was fresh and well-formed, just far too small: that is a volume problem.' }] },
  'etl5-t1': { bites:['a subset of a table','split by a column such as date','jobs can overwrite or scan','only the part they need'] },
  'pj2-t2': { bites:['a requests method that raises an exception','when the HTTP status is an error','so a failed call is never treated as data'] },
  'pj1-t1': { bites:['a job that processes a bounded chunk of data','on a schedule','one chart snapshot per day'] },
  'pj1-t3': { bites:['splitting the pipeline','each file has one responsibility','can be tested on its own'] },
  'pj3-t4': { bites:['a pattern like or "" or .get() with a default','so missing or null fields','don\'t crash the transform'] },
  'pj4-t3': { bites:['a primary key made of more than one column','here (chart_date, track_id)','a track can appear once per day'] },
  'pj7-t1': { bites:['five fields','(minute, hour, day of month, month, day of week)','"17 7 * * *" means 07:17 UTC every day'] },
  'pj7-t2': { bites:['a trigger that lets you run a workflow','manually','from the Actions tab, API or CLI'] },
  'pj7-t3': { bites:['the automatic token\'s rights','contents: write is needed','for the job to push commits back to the repo'] },
  'etl2-t2': { bites:['an operation that updates a row','if its key already exists','and inserts it otherwise'] },
  'pj4-t4': { bites:['an idempotent load','first removes the partition being loaded','then inserts it fresh'],
    aspects:[{ q:'The pipeline ran at 07:17, failed in transform, and you re-ran it at 09:00. Why are there no duplicate rows for today?', o:['load.py deletes today\'s partition before inserting, so a rerun replaces it','DuckDB ignores duplicate rows automatically','GitHub Actions rolls back failed runs','The API returns different songs each time'], why:'Delete-then-insert on the run date makes the load idempotent.' }] }
};

/* =====================================================================
   PLACEMENT TEST BANK
   Levels 1-5, harder as you go. kind:
     sql     -> you write a query; graded by running it and the solution on
                the music sample data and comparing results.
     predict -> read code, type the output (a = accepted answers).
     mcq     -> scenario; o[0] is correct, the others are common mistakes.
   ===================================================================== */
const PLACE_LEVELS = [
  { n:0, name:'Start from lesson 1', lessons:[] },
  { n:1, name:'SQL basics', lessons:['sql1','sql2','sql3'] },
  { n:2, name:'Aggregation, relationships & JOINs', lessons:['sql4','sqlt','sqlr','sql5','sqlm'] },
  { n:3, name:'Intermediate SQL', lessons:['sql6','sql7','sql8','sql9'] },
  { n:4, name:'ETL fundamentals', lessons:['etl1','etl2','etl3','etl4','etl5'] },
  { n:5, name:'Pipeline in practice (Project 1 concepts)', lessons:['pj1','pj2','pj3','pj4','pj5','pj6','pj7','pj8'] }
];
const TINY_GENRE = '<table class="mini"><tr><th>title</th><th>genre</th></tr><tr><td>A</td><td>Afrobeats</td></tr><tr><td>B</td><td>Hip-hop</td></tr><tr><td>C</td><td class="null">NULL</td></tr><tr><td>D</td><td>Afrobeats</td></tr></table>';
const PLACE_BANK = [
  // ---- Level 1
  { id:'p1a', lv:1, kind:'sql', q:'List the <b>title</b> of every song longer than 180 seconds, longest first.', sol:"SELECT title FROM songs WHERE duration_sec > 180 ORDER BY duration_sec DESC;", ordered:true },
  { id:'p1b', lv:1, kind:'predict', q:'Table <code>t</code>:' + TINY_GENRE + 'What number does this return?', code:"SELECT COUNT(*) FROM t WHERE genre <> 'Afrobeats';", a:['1'], why:'Only B. C has a NULL genre, and NULL <> \'Afrobeats\' is UNKNOWN, so WHERE drops it. Many people answer 2.' },
  { id:'p1c', lv:1, kind:'mcq', q:'A report query has no ORDER BY. The top song has "always" come first so far. Is that order guaranteed?', o:['No: without ORDER BY the row order is not guaranteed','Yes: rows come back in insertion order','Yes, if the table has a primary key','Only when LIMIT is used'], why:'A table is an unordered set. Order only exists when you ask for it.' },
  { id:'p1d', lv:1, kind:'sql', q:'Return the distinct <b>genre</b> values in <code>songs</code>, leaving out missing (NULL) genres.', sol:"SELECT DISTINCT genre FROM songs WHERE genre IS NOT NULL;" },
  // ---- Level 2
  { id:'p2a', lv:2, kind:'sql', q:'For each artist, return the <b>name</b> and <b>how many songs</b> they have in <code>songs</code>. Include artists with 0 songs.', sol:"SELECT a.name, COUNT(s.song_id) FROM artists a LEFT JOIN songs s ON s.artist_id = a.artist_id GROUP BY a.artist_id, a.name;" },
  { id:'p2b', lv:2, kind:'predict', q:'Column <code>x</code> in table <code>t</code> holds three rows: 1, NULL, 3.', code:'SELECT AVG(x) FROM t;', a:['2','2.0'], why:'AVG ignores NULL: (1 + 3) / 2 = 2. A common mistake is 4 / 3 = 1.33.' },
  { id:'p2c', lv:2, kind:'mcq', q:'You want only artists whose total streams exceed 200,000. Where does that condition go?', o:['HAVING SUM(streams) > 200000','WHERE SUM(streams) > 200000','WHERE streams > 200000','ORDER BY SUM(streams) > 200000'], why:'WHERE filters rows before grouping and cannot use aggregates; HAVING filters groups.' },
  { id:'p2d', lv:2, kind:'sql', q:'Return each <b>chart_date</b> with its <b>total streams</b> (one row per date).', sol:"SELECT chart_date, SUM(streams) FROM chart_entries GROUP BY chart_date;" },
  { id:'p2e', lv:2, kind:'mcq', q:'You join orders (one row per order) to order_items (many rows per order), then SUM(orders.shipping_fee). The total is far too high. Why?', o:['Fan-out: each order row is repeated once per item','SUM skips NULL values','You need SELECT DISTINCT','INNER JOIN drops rows'], why:'A one-to-many join multiplies the "one" side rows.' },
  { id:'p2f', lv:2, kind:'mcq', q:'<code>listeners</code> and <code>artists</code> share no column. <code>streams(listener_id, song_id)</code> and <code>songs(song_id, artist_id)</code> exist. How do you get each listener\'s artists?', o:['Join listeners → streams → songs → artists, following the foreign keys','Join listeners to artists on name','You cannot: there is no shared column','CROSS JOIN listeners and artists'], why:'Tables connect through shared IDs. The stream events link listeners to songs, and songs.artist_id links songs to artists.' },
  { id:'p2g', lv:2, kind:'mcq', q:'A shop has <code>customers</code>, <code>products</code>, <code>orders</code> and <code>order_items</code>. Where does <code>quantity</code> (how many of a product was bought) belong?', o:['order_items: it describes one product on one order','products','customers','orders'], why:'quantity exists only because a product was put on a particular order, so it lives on the row for that product on that order.' },
  // ---- Level 3
  { id:'p3a', lv:3, kind:'sql', q:'For every row in <code>chart_entries</code>, return <b>chart_date, song_id, position</b> and the song\'s <b>previous position</b> (its position on its previous chart date, NULL if none).', sol:"SELECT chart_date, song_id, position, LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date) FROM chart_entries;" },
  { id:'p3b', lv:3, kind:'sql', q:'Return the <b>title</b> of every song that has <b>never</b> appeared in <code>chart_entries</code>.', sol:"SELECT title FROM songs s WHERE NOT EXISTS (SELECT 1 FROM chart_entries c WHERE c.song_id = s.song_id);" },
  { id:'p3c', lv:3, kind:'predict', q:'Scores in table <code>t</code>: 90, 90, 80.', code:'SELECT score, RANK() OVER (ORDER BY score DESC) AS r FROM t;\n-- what is r for the 80?', a:['3'], why:'RANK gives ties the same number and skips the next: 1, 1, 3. DENSE_RANK would give 2.' },
  { id:'p3d', lv:3, kind:'mcq', q:'<code>artists a LEFT JOIN songs s ON …</code> then <code>WHERE s.duration_sec > 150</code>. What happens to artists with no songs?', o:['They disappear: NULL > 150 is UNKNOWN, so the LEFT JOIN acts like an INNER JOIN','They stay, with NULL song columns','They get duration 0 and are kept','The query errors'], why:'Put conditions on the right table inside ON if you want to keep unmatched left rows.' },
  { id:'p3e', lv:3, kind:'predict', q:'In SQLite (and Postgres):', code:'SELECT 7 / 2;', a:['3'], why:'Integer ÷ integer discards the remainder. Use 7 * 1.0 / 2 for 3.5.' },
  // ---- Level 4
  { id:'p4a', lv:4, kind:'mcq', q:'A daily job INSERTs today\'s rows. It crashes after the insert, and the scheduler retries it. What is the result, and the fix?', o:['Duplicate rows; make the load idempotent (delete-then-insert or upsert for the run date)','Nothing: databases ignore duplicates automatically','The retry overwrites the whole table','Missing rows; add a longer timeout'], why:'Retries are normal. Only an idempotent load makes them safe.' },
  { id:'p4b', lv:4, kind:'sql', q:'Data-quality check: return <b>chart_date</b> and <b>song_id</b> for chart rows where <b>streams is missing</b>.', sol:"SELECT chart_date, song_id FROM chart_entries WHERE streams IS NULL;" },
  { id:'p4c', lv:4, kind:'mcq', q:'A nightly job reloads 3 years of orders (4 hours), though only yesterday\'s rows change. Best approach?', o:['Incremental load using a watermark (last processed timestamp)','Full refresh twice as often','A bigger database server','Move to stream processing with Kafka'], why:'Load only what is new or changed since the last run.' },
  { id:'p4d', lv:4, kind:'mcq', q:'Why save untouched API responses (a raw layer) before transforming?', o:['To replay or re-transform later without calling the source again','Raw JSON is faster to query','SQL requires it','It saves storage space'], why:'Sources change or forget history; your raw copy does not.' },
  { id:'p4e', lv:4, kind:'mcq', q:'The API returned 3 rows today instead of the usual 100, on time and with the right columns. Which check catches this?', o:['Volume check (row count vs expected)','Freshness check','Schema drift check','A unit test of the transform'], why:'Fresh and well-formed, just too few rows: a volume problem.' },
  // ---- Level 5
  { id:'p5a', lv:5, kind:'mcq', q:'chart_movement computes places_gained = prev_position - position, with prev_position from LAG. For a brand-new entry, places_gained is…', o:['NULL, because prev_position is NULL','0','Equal to its position','An error'], why:'Arithmetic with NULL yields NULL; that is how new entries are flagged.' },
  { id:'p5b', lv:5, kind:'mcq', q:'A GitHub Actions schedule is <code>cron: "17 7 * * *"</code>. When does it run?', o:['07:17 UTC every day','17:07 every day','At 17:00 on the 7th of each month','Every 17 minutes from 07:00'], why:'Fields: minute hour day-of-month month day-of-week, in UTC.' },
  { id:'p5c', lv:5, kind:'mcq', q:'Why pass the run date as a parameter (<code>?</code>) instead of building the SQL with an f-string?', o:['It avoids SQL injection and quoting bugs','It makes the query run faster','DuckDB requires it','It makes the load idempotent'], why:'Values travel separately from the SQL text.' },
  { id:'p5d', lv:5, kind:'sql', q:'Drop-outs: return the <b>song_id</b> of songs on the 2026-10-16 chart that are <b>missing</b> from the 2026-10-17 chart.', sol:"SELECT song_id FROM chart_entries WHERE chart_date = '2026-10-16' AND song_id NOT IN (SELECT song_id FROM chart_entries WHERE chart_date = '2026-10-17');" },
  { id:'p5e', lv:5, kind:'mcq', q:'transform.py asserts that chart positions are unique, and today the assert fails. What should the pipeline do?', o:['Stop (fail fast) before load, so no bad data is written and the run shows red','Log a warning and load anyway','Silently drop the duplicates and continue','Retry the API forever'], why:'A quality gate stops the run before bad data reaches the table.' }
];

/* =====================================================================
   v4 TERMINOLOGY DATA  (see source/LEARNING_RULES.md for the full rules)
   GROUND      building-block words, learned once and reused by many terms.
               { name, tip, teach (html), qs: [Question, Question] }
   TERM_BLOCKS term id -> building blocks that must be grounded before the
               term's first phrase starts.
   TERMS4      hand-written tiers for key terms:
               t1: { def: 'text with {phrase one} and {phrase two}.',
                     ph: [ { a: [extra accepted wordings, max 2 more],
                             d: [[near-miss distractor, why it is wrong]],
                             spot: Question, ord: true if word order matters } ] }
               t3: 'advanced definition with {phrases}' (optional)
               Tier 2 is always the app's existing definition (auto-split).
               Terms without an entry get tier 1 = existing definition.
   Question    { q, show?: html, o: [correct, wrong...], why }
               or { q, show?, tap: [[html, 1 correct | 0 wrong | null plain]], inline?: true, why }
   ===================================================================== */
const _h = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MT = (cols, rows) => '<table class="mini"><tr>' + cols.map(c => '<th>' + _h(c) + '</th>').join('') + '</tr>' + rows.map(r => '<tr>' + r.map(v => v === null ? '<td class="null">NULL</td>' : '<td>' + _h(v) + '</td>').join('') + '</tr>').join('') + '</table>';
const QY = s => '<pre class="qy">' + _h(s) + '</pre>';
const LAB = (l, h) => '<div class="lab">' + l + '</div>' + h;
// daily_streams: one song's stream count on one day (a count that changes daily, so it never lives on songs).
// It stores song_id (the key), not the title: the title is stored once, in songs.
const SC_SONGS = MT(['chart_date', 'song_id', 'streams'], [['10-17', 1, 900], ['10-17', 2, 1200], ['10-17', 3, 700]]);
const SC_Q = "SELECT song_id, streams * 2 AS doubled\nFROM daily_streams\nWHERE streams > 800\nORDER BY streams DESC;";
const SC_RES = MT(['song_id', 'doubled'], [[2, 2400], [1, 1800]]);
const SC_ART = MT(['artist_id', 'name'], [[1, 'Burna Boy'], [2, 'Tems'], [3, 'Rema']]);
const SC_SNG = MT(['song_id', 'title', 'artist_id'], [[10, 'Last Last', 1], [11, 'Calm Down', 3], [12, 'Charm', 3]]);
const SC_CHART = LAB('<code>chart</code> is a <b>view</b> (a saved query that joins chart rows to songs and artists), so the artist name repeats here on purpose', MT(['chart_date', 'artist', 'title', 'streams'], [['10-16', 'Rema', 'Calm Down', 1200], ['10-17', 'Rema', 'Calm Down', 1100], ['10-17', 'Tems', 'Free Mind', 800]]));
const SC_PART = LAB('<code>chart_entries</code> (stored, split by chart_date)', MT(['chart_date', 'song_id', 'streams'], [['10-16', 11, 1200], ['10-17', 11, 1100], ['10-17', 12, 800]]));
const SCENE = '<div class="scene">' + LAB('Table <code>daily_streams</code>: one row per song per day. <code>song_id</code> points at the <code>songs</code> table, where each title is stored once', SC_SONGS) + LAB('Query', QY(SC_Q)) + LAB('Output (the result)', SC_RES) + '</div>';

/* =====================================================================
   v6 ILLUSTRATIONS: "illustrate shape-changing concepts first".
   Any concept that changes the SHAPE of data (joins, grouping, windows,
   UNION, DISTINCT, filtering, ORDER BY/LIMIT, CTEs, ETL transforms) is
   shown as BEFORE tables → query → AFTER table, with rows highlighted,
   BEFORE any definition phrases. Lesson flow:
     1. illustration scenes ('illus' steps, one per scene)
     2. interactive visual questions on the same tables ('vq' steps)
     3. theory, code, then building blocks + definition phrases (unchanged rules)
   A lesson's terms only start after its illustration has been seen
   (T.vis[lessonId].seen). Authoring guide: source/LEARNING_RULES.md §9.

   Format  ILLUS[lessonId] = { tables: {name: ILT(name, cols, rows, ddl?)}, scenes: [...], qs: [...] }
   Scene   { h: title, say: html, sql?: shown + runnable on the lesson tables,
             code?: non-SQL code shown (no run), ins: [{ t: tableName | tab: ILT(...) | raw: text,
             m: [row marks], role: label }], out: { c, r, m, nc: [new column idx], ordered?, err? },
             fig: 'venn-inner|left|right|full' | 'flow' | 'lr', vl: [left-only, both, right-only labels],
             note: html, lg: {mark: legend text} }
   Marks   m kept/matched · u kept with no match (NULLs fill the other side) · x not in the
           result · d duplicate · n new/replaced row · g0..g3 group colours
   Question{ k: 'tap', q, sql?, t: tableName (rows to tap), ans: [row idx], why }
           { k: 'mc', q, sql?, o: [correct, ...wrong], why }
           { k: 'run', q, code: starter query, sol: query, forbid?: regex source, why }
   Every scene with sql + out is checked against the real SQL engine by
   source/tests/t6_illus.js, so the drawings can never disagree with SQL.
   ===================================================================== */
const ILT = (n, c, r, ddl) => ({ n, c, r, ddl });
const ILL_ART = ILT('artists', ['artist_id', 'name'], [[1, 'Burna Boy'], [2, 'Tems'], [3, 'Asake']]);
const ILL_SNG = ILT('songs', ['song_id', 'title', 'artist_id'], [[10, 'Last Last', 1], [11, 'Free Mind', 2], [12, 'Mystery Song', 9]]);
const ILL_JSEL = 'SELECT a.name, s.title, s.artist_id\n';
const ILL_ENT = ILT('entries', ['artist', 'title', 'streams'], [['Rema', 'Calm Down', 1200], ['Rema', 'Charm', 500], ['Tems', 'Free Mind', 800], ['Wizkid', 'Essence', 700], ['Tems', 'Me & U', 300]]);
const ILL_POS = ILT('chart', ['chart_date', 'song_id', 'position'], [['10-16', 2, 1], ['10-17', 2, 2], ['10-16', 1, 2], ['10-17', 1, 1], ['10-17', 3, 3]]);
const ILLUS = {
  sql5: {
    tables: { artists: ILL_ART, songs: ILL_SNG },
    scenes: [
      { h: 'Two tables, and which one is LEFT', fig: 'lr',
        say: 'Before any definition, look at the data. <b>artists</b> has one row per artist. <b>songs</b> has one row per song, and <code>songs.artist_id</code> points at <code>artists.artist_id</code>.<br><b>Left or right?</b> It is only about the <b>order you write them</b>: the table after <code>FROM</code> (written first) is the <b>LEFT</b> table; the table after <code>JOIN</code> is the <b>RIGHT</b> table. It has nothing to do with size or keys.',
        sql: 'SELECT a.name, s.title, s.artist_id\nFROM artists a          -- LEFT (first)\nJOIN songs s             -- RIGHT (second)\n  ON s.artist_id = a.artist_id;', norun: true,
        ins: [{ t: 'artists', role: '⬅ LEFT table: written first, after FROM' }, { t: 'songs', role: 'RIGHT table ➡: written after JOIN' }],
        note: 'Two pairs match: Burna Boy (artist 1) with Last Last, and Tems (artist 2) with Free Mind. <b>Asake</b> (artist 3) has no song in <code>songs</code>, and <b>Mystery Song</b> points at artist 9, who does not exist in <code>artists</code>. Watch what each join does with these two unmatched rows.' },
      { h: 'INNER JOIN: only matches', fig: 'venn-inner', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'INNER JOIN keeps a row only when an <code>artists</code> row and a <code>songs</code> row <b>match</b> on artist_id. Asake has no song and Mystery Song has no artist, so neither has a partner, and both disappear. Only the 2 matching pairs remain.',
        sql: ILL_JSEL + 'FROM artists a\nINNER JOIN songs s\n  ON s.artist_id = a.artist_id;',
        ins: [{ t: 'artists', m: ['m', 'm', 'x'], role: '⬅ LEFT (FROM)' }, { t: 'songs', m: ['m', 'm', 'x'], role: 'RIGHT (JOIN) ➡' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2]], m: ['m', 'm'] } },
      { h: 'LEFT JOIN: every left row stays', fig: 'venn-left', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'LEFT JOIN keeps <b>every row of the LEFT table</b>, which here is <code>artists</code>. Asake has no song, but Asake stays, and the columns that would come from <code>songs</code> are filled with <b>NULL</b>. Mystery Song is still dropped, because it is on the right side and LEFT JOIN only keeps unmatched left rows.',
        sql: ILL_JSEL + 'FROM artists a\nLEFT JOIN songs s\n  ON s.artist_id = a.artist_id;',
        ins: [{ t: 'artists', m: ['m', 'm', 'u'], role: '⬅ LEFT (FROM): all kept' }, { t: 'songs', m: ['m', 'm', 'x'], role: 'RIGHT (JOIN) ➡' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2], ['Asake', null, null]], m: ['m', 'm', 'u'] } },
      { h: 'RIGHT JOIN: every right row stays', fig: 'venn-right', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'The tables are written in the same order, but now the other side is kept. RIGHT JOIN keeps <b>every row of the RIGHT table</b>, <code>songs</code>. Mystery Song points at artist 9, who does not exist, so its <code>name</code> is <b>NULL</b>. Asake, a left row with no match, is dropped this time.',
        sql: ILL_JSEL + 'FROM artists a\nRIGHT JOIN songs s\n  ON s.artist_id = a.artist_id;',
        ins: [{ t: 'artists', m: ['m', 'm', 'x'], role: '⬅ LEFT (FROM)' }, { t: 'songs', m: ['m', 'm', 'u'], role: 'RIGHT (JOIN) ➡: all kept' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2], [null, 'Mystery Song', 9]], m: ['m', 'm', 'u'] } },
      { h: 'FULL OUTER JOIN: everything from both', fig: 'venn-full', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'FULL OUTER JOIN keeps <b>all rows from both tables</b>. The result has the 2 matching pairs, plus Asake with a NULL title and Mystery Song with a NULL artist name: 4 rows in total.',
        sql: ILL_JSEL + 'FROM artists a\nFULL OUTER JOIN songs s\n  ON s.artist_id = a.artist_id;',
        ins: [{ t: 'artists', m: ['m', 'm', 'u'], role: '⬅ LEFT (FROM): all kept' }, { t: 'songs', m: ['m', 'm', 'u'], role: 'RIGHT (JOIN) ➡: all kept' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2], ['Asake', null, null], [null, 'Mystery Song', 9]], m: ['m', 'm', 'u', 'u'] },
        note: 'This app runs SQLite 3.49 (in sql.js 1.13), so RIGHT and FULL JOIN run here (they need SQLite 3.39+). MySQL has no FULL OUTER JOIN: there you write a LEFT JOIN, then UNION, then the same query as a RIGHT JOIN.' },
      { h: 'Swap the order, swap the roles', fig: 'venn-left', vl: ['Mystery Song', '2 matches', 'Asake'],
        say: 'Write <b>songs first</b> and it becomes the LEFT table. Now a LEFT JOIN keeps every song, which is exactly what the RIGHT JOIN above did. <b>Any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping the two tables.</b> Most teams only write LEFT JOIN for that reason.',
        sql: ILL_JSEL + 'FROM songs s\nLEFT JOIN artists a\n  ON a.artist_id = s.artist_id;',
        ins: [{ t: 'songs', m: ['m', 'm', 'u'], role: '⬅ LEFT now (FROM): all kept' }, { t: 'artists', m: ['m', 'm', 'x'], role: 'RIGHT now (JOIN) ➡' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2], [null, 'Mystery Song', 9]], m: ['m', 'm', 'u'] } }
    ],
    qs: [
      { k: 'tap', q: 'INNER JOIN: tap the <b>artists</b> rows that survive.', sql: 'FROM artists a INNER JOIN songs s ON s.artist_id = a.artist_id', t: 'artists', ans: [0, 1], why: 'Only artists with a matching song survive. No song has artist_id 3, so Asake is dropped.' },
      { k: 'tap', q: 'LEFT JOIN: tap the <b>songs</b> rows that appear in the result.', sql: 'FROM artists a LEFT JOIN songs s ON s.artist_id = a.artist_id', t: 'songs', ans: [0, 1], why: 'LEFT JOIN keeps every artist (left), not every song. Mystery Song points at artist 9, who does not exist, so it is dropped.' },
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT a.name, s.title FROM artists a FULL OUTER JOIN songs s ON s.artist_id = a.artist_id;', o: ['4', '3', '2', '6'], why: '2 matches + Asake (no song) + Mystery Song (no artist) = 4.' },
      { k: 'mc', q: 'In the LEFT JOIN result, why is <code>title</code> NULL for Asake?', o: ['No song has artist_id 3, so there is nothing to fill the right-side columns', 'Asake\'s song has an empty title in the songs table', 'NULL means the title is an empty string', 'The join failed for that row'], why: 'LEFT JOIN keeps Asake anyway and fills the right side with NULL: "no match", not "empty".' },
      { k: 'mc', q: 'Which is the <b>LEFT</b> table here?', sql: 'SELECT a.name, s.title\nFROM songs s\nLEFT JOIN artists a ON a.artist_id = s.artist_id;', o: ['songs: it is written first, after FROM', 'artists: it holds the primary key', 'artists: it comes after JOIN', 'whichever table is bigger'], why: 'Left and right are only about written order. songs is written after FROM, so it is the LEFT table; artists is written after JOIN, so it is the RIGHT table.' },
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT a.name, s.title FROM artists a RIGHT JOIN songs s ON s.artist_id = a.artist_id;', o: ['3', '2', '4', '1'], why: 'Every song (right table) stays: 2 matches + Mystery Song with NULL name. Asake is dropped.' },
      { k: 'mc', q: 'Rewrite <code>FROM artists a RIGHT JOIN songs s ON …</code> as a LEFT JOIN.', o: ['FROM songs s LEFT JOIN artists a ON …', 'FROM artists a LEFT JOIN songs s ON …', 'FROM songs s RIGHT JOIN artists a ON …', 'It cannot be rewritten'], why: 'Swap the tables: the one you wanted to keep in full (songs) goes after FROM.' },
      { k: 'run', q: 'Run it: fill the blank so <b>Asake stays</b> (with a NULL title). Press ▶ Run to see the result, then ✓ Check.', code: 'SELECT a.name, s.title, s.artist_id\nFROM artists a\n____ JOIN songs s\n  ON s.artist_id = a.artist_id;', sol: 'SELECT a.name, s.title, s.artist_id FROM artists a LEFT JOIN songs s ON s.artist_id = a.artist_id;', why: 'LEFT JOIN keeps every row of the left table (artists). FULL would also add Mystery Song.' },
      { k: 'run', q: 'Run it: keep <b>every song</b>, even Mystery Song, <b>without</b> RIGHT JOIN.', code: 'SELECT a.name, s.title, s.artist_id\nFROM ____\nLEFT JOIN ____\n  ON a.artist_id = s.artist_id;', sol: 'SELECT a.name, s.title, s.artist_id FROM songs s LEFT JOIN artists a ON a.artist_id = s.artist_id;', forbid: 'right\\s+join|full', why: 'FROM songs s LEFT JOIN artists a: songs is written first, so it is the left table and every song is kept.' }
    ] },
  sql2: {
    tables: { daily_streams: ILT('daily_streams', ['chart_date', 'song_id', 'streams'], [['10-17', 1, 900], ['10-17', 2, 1200], ['10-17', 3, 700], ['10-17', 4, null]]) },
    scenes: [
      { h: 'WHERE keeps fewer rows', fig: 'flow', say: 'The table <code>daily_streams</code> holds one row per song per day, with the song\u2019s ID and its stream count. WHERE checks the condition <code>streams &gt; 800</code> on <b>each row</b>. Rows where it is TRUE stay, and rows where it is FALSE <b>or UNKNOWN</b> are dropped. The columns do not change; only the number of rows does.',
        sql: 'SELECT song_id, streams\nFROM daily_streams\nWHERE streams > 800;', ins: [{ t: 'daily_streams', m: ['m', 'm', 'x', 'x'] }],
        out: { c: ['song_id', 'streams'], r: [[1, 900], [2, 1200]], m: ['m', 'm'] },
        note: 'Song 4\u2019s stream count for 10-17 is missing (NULL). <code>NULL &gt; 800</code> is UNKNOWN, not TRUE, so that row is dropped too. Stream counts change every day, which is why they live in a daily table and not on <code>songs</code>.' },
      { h: 'Finding the missing values', fig: 'flow', say: 'Now we want the rows whose value is missing. A comparison such as <code>streams = NULL</code> is UNKNOWN for every row, so it never keeps anything. The test that works is <code>IS NULL</code>, and here it keeps only song 4\u2019s row.',
        sql: 'SELECT song_id, streams\nFROM daily_streams\nWHERE streams IS NULL;', ins: [{ t: 'daily_streams', m: ['x', 'x', 'x', 'm'] }],
        out: { c: ['song_id', 'streams'], r: [[4, null]], m: ['m'] } }
    ],
    qs: [
      { k: 'tap', q: 'Tap the rows kept by <code>WHERE streams &lt; 1000</code>.', t: 'daily_streams', ans: [0, 2], why: 'Song 1 (900) and song 3 (700). Song 4\'s NULL makes the test UNKNOWN, so its row is dropped.' },
      { k: 'mc', q: 'How many rows does this return?', sql: "SELECT song_id FROM daily_streams WHERE streams <> 900;", o: ['2', '3', '4', '1'], why: 'Songs 2 and 3. Song 1 has exactly 900, and NULL <> 900 is UNKNOWN, so song 4 is dropped too.' }
    ] },
  sql3: {
    tables: { chart: ILT('chart', ['title', 'artist', 'streams'], [['Rush', 'Ayra Starr', 900], ['Calm Down', 'Rema', 1200], ['Essence', 'Wizkid', 700], ['Charm', 'Rema', 500]]) },
    scenes: [
      { h: 'ORDER BY + LIMIT: sort, then cut', fig: 'flow', say: 'The view <code>chart</code> lists one day’s songs with their stream counts. <code>ORDER BY streams DESC</code> sorts the <b>result rows</b> from the highest count to the lowest, and <code>LIMIT 2</code> then keeps only the first two. Together they answer “which 2 songs had the most streams?”: Calm Down (1200) and Rush (900).',
        sql: 'SELECT title, streams\nFROM chart\nORDER BY streams DESC\nLIMIT 2;', ins: [{ t: 'chart', m: ['m', 'm', 'x', 'x'], role: 'chart: a view (one day\u2019s chart joined to artists, so names repeat on purpose)' }],
        out: { c: ['title', 'streams'], r: [['Calm Down', 1200], ['Rush', 900]], m: ['m', 'm'], ordered: true }, lg: { m: '✓ in the top 2' } },
      { h: 'DISTINCT: duplicates collapse', fig: 'flow', say: 'DISTINCT removes duplicate <b>result rows</b>. The query asks only for the <code>artist</code> column, and Rema appears in two rows of <code>chart</code>, so those two identical result rows collapse into one. The colours show which input rows collapse together.',
        sql: 'SELECT DISTINCT artist\nFROM chart;', ins: [{ t: 'chart', m: ['g0', 'g1', 'g2', 'g1'], role: 'chart: a view (one day\u2019s chart joined to artists, so names repeat on purpose)' }],
        out: { c: ['artist'], r: [['Ayra Starr'], ['Rema'], ['Wizkid']], m: ['g0', 'g1', 'g2'] } }
    ],
    qs: [
      { k: 'tap', q: 'Tap the rows returned by <code>ORDER BY streams LIMIT 2</code> (ascending).', t: 'chart', ans: [2, 3], why: 'Ascending puts the smallest first: Charm (500), then Essence (700).' },
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT DISTINCT artist, title FROM chart;', o: ['4', '3', '2', '1'], why: 'DISTINCT applies to the whole selected row. Every (artist, title) pair is different, so all 4 stay.' }
    ] },
  sql4: {
    tables: { entries: ILL_ENT,
      songs: ILT('songs', ['song_id', 'title', 'artist_id'], [[2, 'Calm Down', 1], [4, 'Free Mind', 2], [6, 'Me & U', 2], [3, 'Essence', 3], [7, 'Rush', 4], [5, 'Charm', 1]]),
      artists: ILT('artists', ['artist_id', 'name'], [[1, 'Rema'], [2, 'Tems'], [3, 'Wizkid'], [4, 'Ayra Starr']]) },
    scenes: [
      { h: 'GROUP BY: many rows become one per group', fig: 'flow', say: 'The view <code>entries</code> has one row per song, with the artist’s name repeated on each. Each colour marks one group: all the rows of one artist. GROUP BY collapses each group into <b>one row</b>, and the aggregates (COUNT and SUM) summarise the rows inside it. 5 rows go in and 3 rows come out, one per artist.',
        sql: 'SELECT artist, COUNT(*) AS songs, SUM(streams) AS total\nFROM entries\nGROUP BY artist;', ins: [{ t: 'entries', m: ['g0', 'g0', 'g1', 'g2', 'g1'], role: 'entries: a view (one day\u2019s chart rows joined to artists, so names repeat on purpose)' }],
        out: { c: ['artist', 'songs', 'total'], r: [['Rema', 2, 1700], ['Tems', 2, 1100], ['Wizkid', 1, 700]], m: ['g0', 'g1', 'g2'], nc: [1, 2] },
        note: 'Grouping by the artist name works here only because each name in this small view belongs to one artist. On real tables you group by the key, <code>artist_id</code>, as the last picture in this lesson shows.' },
      { h: 'WHERE filters rows before grouping', fig: 'flow', say: 'WHERE runs <b>before</b> GROUP BY and tests single rows. Charm (500 streams) and Me & U (300) fail <code>streams &gt;= 700</code>, so they are removed <b>before</b> the groups are built and never reach SUM. That is why Rema’s total is now 1200 instead of 1700.',
        sql: 'SELECT artist, SUM(streams) AS total\nFROM entries\nWHERE streams >= 700\nGROUP BY artist;', ins: [{ t: 'entries', m: ['g0', 'x', 'g1', 'g2', 'x'], role: 'entries: a view (one day\u2019s chart rows joined to artists, so names repeat on purpose)' }],
        out: { c: ['artist', 'total'], r: [['Rema', 1200], ['Tems', 800], ['Wizkid', 700]], m: ['g0', 'g1', 'g2'], nc: [1] } },
      { h: 'HAVING filters groups after grouping', fig: 'flow', say: 'HAVING runs <b>after</b> GROUP BY, on whole groups. The groups are the same three artists as before, but now the condition is tested on each group\'s total. Wizkid\'s group totals 700, which is not above 1000, so the whole group is removed.',
        sql: 'SELECT artist, SUM(streams) AS total\nFROM entries\nGROUP BY artist\nHAVING SUM(streams) > 1000;', ins: [{ t: 'entries', m: ['g0', 'g0', 'g1', 'x', 'g1'], role: 'entries: a view (one day\u2019s chart rows joined to artists, so names repeat on purpose)' }],
        out: { c: ['artist', 'total'], r: [['Rema', 1700], ['Tems', 1100]], m: ['g0', 'g1'], nc: [1] } },
      { h: 'A column that is neither grouped nor aggregated', fig: 'flow', say: 'This query groups <code>entries</code> by artist but also asks for <code>title</code>. Rema\'s group has two titles, Calm Down and Charm, and Tems\'s group has Free Mind and Me & U, yet each group becomes one result row with one title cell. Nothing in the query says which title to show. Postgres and DuckDB refuse to run it. SQLite runs it and picks a title from an arbitrary row of the group, so the answer looks fine but means nothing.',
        sql: 'SELECT artist, title, SUM(streams) AS total\nFROM entries\nGROUP BY artist;', norun: true,
        ins: [{ t: 'entries', m: ['g0', 'g0', 'g1', 'g2', 'g1'], role: 'entries: a view (one day\u2019s chart rows joined to artists, so names repeat on purpose)' }],
        after: [{ tab: ILT('result', ['artist', 'title', 'total'], [['Rema', 'Calm Down or Charm?', 1700], ['Tems', 'Free Mind or Me & U?', 1100], ['Wizkid', 'Essence', 700]]), m: ['x', 'x', 'g2'], role: 'result: one row per group, but which title?' }],
        lg: { x: '✕ several titles, one cell: no single right answer', g: '🎨 same colour = same group' } },
      { h: 'The safe habit, and when grouping by a key is enough', fig: 'flow', say: 'Here the tables are <code>songs</code> and <code>artists</code>, joined on <code>artist_id</code>. We want each artist\'s name next to their song count. Every artist_id has exactly one name, because artist_id is the primary key of artists: the name is <b>functionally dependent</b> on the key. Standard SQL, and Postgres, therefore accept <code>GROUP BY a.artist_id</code> alone. The safe habit, which works on every engine, is to list both columns in GROUP BY, as below.',
        sql: 'SELECT a.artist_id, a.name, COUNT(*) AS songs\nFROM songs s\nJOIN artists a ON a.artist_id = s.artist_id\nGROUP BY a.artist_id, a.name;',
        ins: [{ t: 'songs', m: ['g0', 'g1', 'g1', 'g2', '', 'g0'], role: 'songs (artist_id is the main artist)' }, { t: 'artists', m: ['g0', 'g1', 'g2'], role: 'artists (artist_id is the primary key)' }],
        out: { c: ['artist_id', 'name', 'songs'], r: [[1, 'Rema', 2], [2, 'Tems', 2], [3, 'Wizkid', 1], [4, 'Ayra Starr', 1]], m: ['g0', 'g1', 'g2', ''], nc: [2] }, stack: true,
        lg: { g: '🎨 same colour = same artist' } }
    ],
    qs: [
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT artist, COUNT(*) FROM entries GROUP BY artist;', o: ['3', '5', '2', '1'], why: 'One row per distinct artist: Rema, Tems, Wizkid.' },
      { k: 'tap', q: 'Tap the rows that reach the groups in <code>WHERE streams &gt; 750 GROUP BY artist</code>.', t: 'entries', ans: [0, 2], why: 'WHERE filters single rows first: only Calm Down (1200) and Free Mind (800) pass.' },
      { k: 'mc', q: '"Only artists whose total streams exceed 1,000." Where does the condition go?', o: ['HAVING SUM(streams) > 1000', 'WHERE SUM(streams) > 1000', 'WHERE streams > 1000', 'ORDER BY SUM(streams) > 1000'], why: 'It is a condition on a group total, so it goes in HAVING, after GROUP BY.' },
      { k: 'mc', ref: false, q: 'What is wrong with <code>SELECT artist, title, SUM(streams) FROM entries GROUP BY artist</code>?', o: ['title has several values per artist and is neither grouped nor aggregated, so no single title is correct', 'nothing: SQLite runs it, so it is valid SQL', 'SUM cannot be used with GROUP BY', 'it must also GROUP BY streams'],
        w: [null, 'SQLite is lenient and picks a title from an arbitrary row. Postgres and DuckDB reject the query, and the title SQLite shows means nothing.', 'SUM is exactly what GROUP BY is for: one total per group.', 'Grouping by streams would make a group per stream count and break the per-artist totals.'],
        why: 'Each group becomes one row, so every column must have one value per group: grouped, aggregated (for example MAX(title)), or functionally dependent on the grouped key.' },
      { k: 'mc', ref: false, q: 'You group by <code>artists.artist_id</code> (the primary key) and also select <code>artists.name</code>. Which statement is accurate?', o: ['It is valid in standard SQL and Postgres, because each artist_id has exactly one name; adding name to GROUP BY is the habit that works everywhere', 'It is always an error: name must be in the GROUP BY', 'It works only because SQLite is lenient', 'It returns one row per name instead of per artist'],
        w: [null, 'This is the simple rule stated too strongly. Standard SQL allows columns that are functionally dependent on the grouped key.', 'SQLite would run it, but it is also valid standard SQL here, because name depends on the primary key.', 'The groups are still one per artist_id; name just has one value per group.'],
        why: 'A column that has exactly one value per group (functionally dependent on the key) is safe to select. Listing it in GROUP BY as well costs nothing and is accepted by every engine.' },
      { k: 'mc', ref: false, q: '🛒 Shop: you want each customer\u2019s name and their number of orders. Which query is correct on every engine?', o: ['SELECT c.customer_id, c.name, COUNT(*) FROM orders o JOIN customers c ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name', 'SELECT c.name, o.order_date, COUNT(*) FROM orders o JOIN customers c ON c.customer_id = o.customer_id GROUP BY c.name', 'SELECT c.name, COUNT(*) FROM orders o JOIN customers c ON c.customer_id = o.customer_id GROUP BY c.name', 'SELECT c.customer_id, c.name, COUNT(*) FROM orders o JOIN customers c ON c.customer_id = o.customer_id'],
        w: [null, 'order_date has many values per customer and is neither grouped nor aggregated, so no single date is correct.', 'It runs, but two different customers with the same name would be merged into one group. Group by the key.', 'Without GROUP BY, COUNT(*) collapses everything into one row, and Postgres or DuckDB reject the extra columns.'],
        why: 'Group by the key (customer_id) so that each customer is one group, and list the name too so every engine accepts it.' }
    ] },
  sql6: {
    tables: { entries: ILL_ENT },
    scenes: [
      { h: 'A subquery used as a filter', fig: 'flow', say: 'The query inside the brackets is a <b>subquery</b>. It runs first and returns <b>one value</b>: the average stream count in <code>entries</code>, which is 700. The outer WHERE then compares each row with that value and keeps the rows above it. Essence has exactly 700, which is not above 700, so it is dropped.',
        sql: 'SELECT title, streams\nFROM entries\nWHERE streams > (SELECT AVG(streams) FROM entries);', ins: [{ t: 'entries', m: ['m', 'x', 'm', 'x', 'x'], role: 'entries: a view (one day\u2019s chart rows joined to artists, so names repeat on purpose)' }],
        out: { c: ['title', 'streams'], r: [['Calm Down', 1200], ['Free Mind', 800]], m: ['m', 'm'] } }
    ],
    qs: [{ k: 'mc', q: 'What single value does the subquery <code>(SELECT AVG(streams) FROM entries)</code> return?', o: ['700', '3500', '1200', '5'], why: '(1200 + 500 + 800 + 700 + 300) / 5 = 700.' }] },
  sql7: {
    tables: { entries: ILL_ENT, chart_mon: ILT('chart_mon', ['title'], [['Rush'], ['Calm Down']]), chart_tue: ILT('chart_tue', ['title'], [['Calm Down'], ['Essence']]) },
    scenes: [
      { h: 'A CTE is a named, temporary result', fig: 'flow', say: 'The query starts with <code>WITH totals AS (…)</code>. That part is a <b>CTE</b> (common table expression): a named result, here one row per artist with their total streams, which exists only while this query runs. The final SELECT then reads <code>totals</code> as if it were a table and keeps the artists above 1000.',
        sql: 'WITH totals AS (\n  SELECT artist, SUM(streams) AS total\n  FROM entries GROUP BY artist\n)\nSELECT artist, total\nFROM totals\nWHERE total > 1000;',
        ins: [{ t: 'entries', m: ['g0', 'g0', 'g1', 'g2', 'g1'], role: 'entries (a saved view)' }, { tab: ILT('totals', ['artist', 'total'], [['Rema', 1700], ['Tems', 1100], ['Wizkid', 700]]), m: ['g0', 'g1', 'x'], role: 'totals (the CTE: step 1)' }],
        out: { c: ['artist', 'total'], r: [['Rema', 1700], ['Tems', 1100]], m: ['g0', 'g1'] } },
      { h: 'UNION ALL stacks every row', fig: 'flow', say: 'UNION ALL places the rows of the second query <b>under</b> the rows of the first. Calm Down is on both Monday’s and Tuesday’s chart, so it appears twice in the result, which has 4 rows.',
        sql: 'SELECT title FROM chart_mon\nUNION ALL\nSELECT title FROM chart_tue;', ins: [{ t: 'chart_mon', m: ['g0', 'g1'], role: 'chart_mon: a view (titles on Monday\u2019s chart)' }, { t: 'chart_tue', m: ['g1', 'g2'], role: 'chart_tue: a view (titles on Tuesday\u2019s chart)' }],
        out: { c: ['title'], r: [['Rush'], ['Calm Down'], ['Calm Down'], ['Essence']], m: ['g0', 'g1', 'd', 'g2'] }, lg: { d: '2× duplicate: UNION ALL keeps it' } },
      { h: 'UNION removes duplicates', fig: 'flow', say: 'UNION also stacks the two results, but then <b>removes duplicate rows</b>, so Calm Down appears once and the result has 3 rows. Removing duplicates is an extra step that usually costs time, so use UNION ALL unless you need the duplicates removed.',
        sql: 'SELECT title FROM chart_mon\nUNION\nSELECT title FROM chart_tue;', ins: [{ t: 'chart_mon', m: ['g0', 'g1'], role: 'chart_mon: a view (titles on Monday\u2019s chart)' }, { t: 'chart_tue', m: ['d', 'g2'], role: 'chart_tue: a view (titles on Tuesday\u2019s chart)' }], lg: { d: '2× duplicate: UNION removes it' },
        out: { c: ['title'], r: [['Calm Down'], ['Essence'], ['Rush']], m: ['g1', 'g2', 'g0'] } }
    ],
    qs: [
      { k: 'mc', q: 'How many rows does <code>UNION ALL</code> return here?', sql: 'SELECT title FROM chart_mon UNION ALL SELECT title FROM chart_tue;', o: ['4', '3', '2', '6'], why: '2 + 2 = 4. UNION ALL keeps the duplicate Calm Down.' },
      { k: 'mc', q: 'And with <code>UNION</code>?', sql: 'SELECT title FROM chart_mon UNION SELECT title FROM chart_tue;', o: ['3', '4', '2', '1'], why: 'Rush, Calm Down, Essence: the duplicate is removed.' }
    ] },
  sql8: {
    tables: { chart: ILL_POS,
      chart_named: ILT('chart_named', ['chart_date', 'song_id', 'title', 'position'], [['10-16', 5, 'Love', 3], ['10-17', 5, 'Love', 8], ['10-17', 6, 'Love', 2]]) },
    scenes: [
      { h: 'PARTITION BY + LAG: rows are kept', fig: 'flow', say: 'The table <code>chart</code> holds one row per song per chart day, identified by <code>song_id</code> (song 1 is Rush, song 2 is Calm Down and song 3 is Essence; the titles are stored once, in <code>songs</code>). Unlike GROUP BY, a window function <b>keeps every row</b> (5 in, 5 out) and <b>adds a column</b>. <code>PARTITION BY song_id</code> splits the rows into one group per song (one colour each), and LAG reads the previous row inside the same group.',
        sql: 'SELECT song_id, chart_date, position,\n  LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date) AS prev\nFROM chart;', ins: [{ t: 'chart', m: ['g0', 'g0', 'g1', 'g1', 'g2'] }],
        out: { c: ['song_id', 'chart_date', 'position', 'prev'], r: [[2, '10-16', 1, null], [2, '10-17', 2, 1], [3, '10-17', 3, null], [1, '10-16', 2, null], [1, '10-17', 1, 2]], m: ['g0', 'g0', 'g2', 'g1', 'g1'], nc: [3] },
        note: 'The first row of each group has no previous row, so <code>prev</code> is NULL. That is how a new entry shows up.' },
      { h: 'ROW_NUMBER numbers rows inside each partition', fig: 'flow', say: 'This time the window is split by day: <code>PARTITION BY chart_date</code> makes one group per chart day, and ROW_NUMBER counts the rows of each day in position order. Each day starts again at 1, and all 5 rows are still in the result.',
        sql: 'SELECT chart_date, song_id, position,\n  ROW_NUMBER() OVER (PARTITION BY chart_date ORDER BY position) AS rn\nFROM chart;', ins: [{ t: 'chart', m: ['g0', 'g1', 'g0', 'g1', 'g1'] }],
        out: { c: ['chart_date', 'song_id', 'position', 'rn'], r: [['10-16', 2, 1, 1], ['10-16', 1, 2, 2], ['10-17', 1, 1, 1], ['10-17', 2, 2, 2], ['10-17', 3, 3, 3]], m: ['g0', 'g0', 'g1', 'g1', 'g1'], nc: [3] } },
      { h: 'Why the key is song_id, not the title', fig: 'flow', say: 'Titles are not unique: here two <b>different</b> songs are both called "Love" (song 5 and song 6). <code>chart_named</code> is a view that shows the title next to the ID. If we partition by <code>title</code>, both songs land in one group, and LAG hands each of them the other song\u2019s position. Song 6 is brand new, yet it gets a "previous" position of 3, and song 5 gets 2 instead of its own 3.',
        sql: 'SELECT chart_date, song_id, position,\n  LAG(position) OVER (PARTITION BY title ORDER BY chart_date, position) AS prev\nFROM chart_named;',
        ins: [{ t: 'chart_named', m: ['g0', 'g0', 'g0'], role: 'chart_named: a view (chart rows with the title shown)' }],
        out: { c: ['chart_date', 'song_id', 'position', 'prev'], r: [['10-16', 5, 3, null], ['10-17', 6, 2, 3], ['10-17', 5, 8, 2]], m: ['', 'x', 'x'], nc: [3] },
        lg: { x: '✕ wrong: this is the other song\u2019s position' } },
      { h: 'Partition by the key, and each song keeps its own history', fig: 'flow', say: 'Now the same query uses <code>PARTITION BY song_id</code>. Song 5 and song 6 are separate groups, so song 5 correctly gets 3 (its own position on 10-16), and song 6 correctly gets NULL because it is a new entry. A key such as song_id is unique by design, which is why IDs, not names, identify rows.',
        sql: 'SELECT chart_date, song_id, position,\n  LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date) AS prev\nFROM chart_named;',
        ins: [{ t: 'chart_named', m: ['g0', 'g0', 'g1'], role: 'chart_named: a view (chart rows with the title shown)' }],
        out: { c: ['chart_date', 'song_id', 'position', 'prev'], r: [['10-16', 5, 3, null], ['10-17', 5, 8, 3], ['10-17', 6, 2, null]], m: ['g0', 'g0', 'g1'], nc: [3] },
        lg: { g: '🎨 same colour = same song (same song_id)' } }
    ],
    qs: [
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT song_id, LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date) FROM chart;', o: ['5', '3', '2', '1'], why: 'Window functions keep every row: 5 in, 5 out. GROUP BY song_id would return 3.' },
      { k: 'mc', q: 'In the first picture, why is <code>prev</code> NULL for song 3?', o: ['It is the first (only) row in its partition, so there is no previous row', 'Song 3 has no position', 'LAG always returns NULL for the last row', 'Song 3 was filtered out'], why: 'LAG looks one row back inside the same partition. Song 3\'s partition has only one row.' },
      { k: 'mc', ref: false, q: 'Two different songs are both called "Love". Which window gives each song its own previous position?', o: ['PARTITION BY song_id ORDER BY chart_date', 'PARTITION BY title ORDER BY chart_date', 'PARTITION BY chart_date ORDER BY position', 'no PARTITION BY at all'],
        w: [null, 'This is the version that only works while titles happen to be unique. With two songs called "Love", they share one partition and LAG mixes their positions.', 'This groups by day, so LAG would read the song one place above on the same day, not the same song yesterday.', 'Without a partition every row is in one group, so LAG reads whatever row came before, from any song.'],
        why: 'A partition must be one song, and the only column that always means one song is its key, song_id.' },
      { k: 'mc', ref: false, q: '🛒 Shop: you use LAG to find each customer\u2019s previous order. Two customers are both named "Ada Okafor". What do you partition by?', o: ['customer_id', 'customer_name', 'order_date', 'order_total'],
        w: [null, 'Names repeat. Both Adas would share one partition, and one Ada\u2019s "previous order" could be the other Ada\u2019s order.', 'That groups orders by day, not by person.', 'The amount says nothing about who placed the order.'],
        why: 'Each customer has exactly one customer_id, and no two customers share it. That is the definition of a key, so it is the safe thing to partition by.' }
    ] },
  sql9: {
    tables: { raw: ILT('raw', ['title', 'streams'], [['  Rush ', '900'], ['Calm Down', null], ['Essence', '700']]) },
    scenes: [
      { h: 'Cleaning keeps the rows, fixes the values', fig: 'flow', say: 'The table <code>raw</code> holds values exactly as they arrived: a title with extra spaces (shown as ␣), stream counts stored as text, and one missing count. TRIM removes the spaces, CAST turns the text into a number, and COALESCE replaces the NULL with 0. The result has the same 3 rows, with cleaner values.',
        sql: 'SELECT TRIM(title) AS title,\n  COALESCE(CAST(streams AS INTEGER), 0) AS streams\nFROM raw;', ins: [{ t: 'raw', m: ['n', 'n', 'm'], role: 'raw: the source data as received, before cleaning' }],
        out: { c: ['title', 'streams'], r: [['Rush', 900], ['Calm Down', 0], ['Essence', 700]], m: ['n', 'n', 'm'] }, lg: { n: '＋ value changed', m: '✓ unchanged' } }
    ],
    qs: [{ k: 'mc', q: 'Why does Calm Down end up with streams = 0?', o: ['Its streams was NULL and COALESCE(…, 0) replaced it', 'CAST turns text into 0', 'TRIM removed the number', 'The row was filtered out'], why: 'COALESCE returns the first non-NULL argument: NULL → 0.' }] },
  etl1: {
    tables: { raw_tracks: ILT('raw_tracks', ['title', 'streams'], [[' Rush', '900'], [null, '450'], ['Essence ', '700']]) },
    scenes: [
      { h: 'Transform: raw → staging', fig: 'flow', say: 'The raw layer, <code>raw_tracks</code>, keeps the source exactly as received. The transform step reads it and produces a cleaned staging result: it trims the titles, converts the stream counts from text to integers, and <b>drops rows that fail a rule</b>. Here the rule is “every row needs a title”, so the row with a NULL title is dropped.',
        sql: "SELECT TRIM(title) AS title, CAST(streams AS INTEGER) AS streams\nFROM raw_tracks\nWHERE title IS NOT NULL;", ins: [{ t: 'raw_tracks', m: ['n', 'x', 'n'], role: 'raw (untouched)' }],
        out: { c: ['title', 'streams'], r: [['Rush', 900], ['Essence', 700]], m: ['n', 'n'] }, lg: { n: '＋ cleaned' } }
    ],
    qs: [{ k: 'mc', q: 'After this transform, how many rows reach staging?', o: ['2', '3', '1', '0'], why: 'The row with a missing title fails the rule; the other two are cleaned and kept. Raw still has all 3.' }] },
  etl2: {
    tables: { target: ILT('target', ['chart_date', 'song_id'], [['10-16', 1], ['10-16', 2], ['10-17', 1], ['10-17', 2]]), batch: ILT('batch', ['chart_date', 'song_id'], [['10-17', 1], ['10-17', 2]]),
      chart_entries: ILT('chart_entries', ['chart_date', 'song_id', 'position'], [['10-16', 1, 1], ['10-16', 2, 2], ['10-17', 2, 1], ['10-17', 1, 2]]) },
    scenes: [
      { h: 'What "the run date\u2019s partition" means', fig: 'flow', say: 'A <b>partition</b> is the slice of a table that shares one value of the partition key, here <code>chart_date</code>. In your DuckDB project, <code>chart_entries</code> is <b>one table</b>, and "the 10-17 partition" simply means its rows <code>WHERE chart_date = \'10-17\'</code>. That is a <b>logical</b> slice: nothing is stored separately. The query below reads it.',
        sql: "SELECT * FROM chart_entries\nWHERE chart_date = '10-17';", ins: [{ t: 'chart_entries', m: ['g0', 'g0', 'g1', 'g1'], role: 'DuckDB: one table; colours show the two date slices' }],
        out: { c: ['chart_date', 'song_id', 'position'], r: [['10-17', 2, 1], ['10-17', 1, 2]], m: ['g1', 'g1'] } },
      { h: 'Warehouses can store each partition separately', fig: 'flow', say: 'A warehouse such as BigQuery can declare a <b>partitioned table</b>, and a data lake can store one folder of Parquet files per date (Hive-style partitioning). Then each date is stored <b>physically apart</b> (in its own storage blocks or folder), so a query that filters on the date reads only that part. This is called <b>partition pruning</b>, and it is why big daily tables stay cheap to query. The idea is the same as in DuckDB; only the storage differs.',
        ins: [{ t: 'chart_entries', m: ['g0', 'g0', 'g1', 'g1'], role: 'the same rows, before partitioning' }],
        after: [{ tab: ILT('chart_entries · 10-16', ['song_id', 'position'], [[1, 1], [2, 2]]), m: ['g0', 'g0'], role: 'stored part 1: date 10-16' }, { tab: ILT('chart_entries · 10-17', ['song_id', 'position'], [[2, 1], [1, 2]]), m: ['g1', 'g1'], role: 'stored part 2: date 10-17' }],
        note: 'In both cases a load can replace one date without touching the others. That is what the next two pictures use.' },
      { h: 'A retry with plain INSERT duplicates rows', fig: 'flow', say: 'The table <code>target</code> already holds the 10-17 load (4 rows in total). The scheduler retries the job, and a plain INSERT adds the 2 rows of <code>batch</code> again. Now there are 6 rows, and 2 of them are duplicates.',
        sql: "INSERT INTO target SELECT * FROM batch;\nSELECT * FROM target;", ins: [{ t: 'target', role: 'target before the retry' }, { t: 'batch', role: 'batch for 10-17' }],
        out: { c: ['chart_date', 'song_id'], r: [['10-16', 1], ['10-16', 2], ['10-17', 1], ['10-17', 2], ['10-17', 1], ['10-17', 2]], m: ['m', 'm', 'm', 'm', 'd', 'd'] } },
      { h: 'Delete-then-insert is idempotent', fig: 'flow', say: 'This time the job first deletes the run date\u2019s partition (the 10-17 rows) and then inserts the batch. Run it once or ten times and the table always ends with the same 4 rows. The 10-16 partition is never touched.',
        sql: "DELETE FROM target WHERE chart_date = '10-17';\nINSERT INTO target SELECT * FROM batch;\nSELECT * FROM target;", ins: [{ t: 'target', m: ['m', 'm', 'x', 'x'], role: 'target before' }, { t: 'batch', m: ['n', 'n'], role: 'batch for 10-17' }],
        out: { c: ['chart_date', 'song_id'], r: [['10-16', 1], ['10-16', 2], ['10-17', 1], ['10-17', 2]], m: ['m', 'm', 'n', 'n'] }, lg: { x: '✕ deleted first', n: '＋ inserted again' } }
    ],
    qs: [
      { k: 'mc', q: 'The plain INSERT job is retried <b>twice more</b> for 10-17 (starting from the 4-row table). How many rows?', o: ['8', '6', '4', '10'], why: 'Each retry adds the 2 rows again: 4 + 2 + 2 = 8.' },
      { k: 'mc', q: 'The delete-then-insert job runs 3 times for 10-17. How many rows?', o: ['4', '8', '6', '2'], why: 'Each run deletes the 10-17 rows first, so the result is the same every time: idempotent.' },
      { k: 'mc', ref: false, q: 'In your DuckDB project, what is "the 10-17 partition" of chart_entries?', o: ['the rows of the one chart_entries table WHERE chart_date = \'10-17\' (a logical slice)', 'a separate file that DuckDB keeps for 10-17', 'a copy of the table made for 10-17', 'the chart_date column'],
        w: [null, 'Your table is not declared as partitioned, so there is no separate file per date. Warehouses such as BigQuery can store dates separately; your DuckDB table does not.', 'Nothing is copied. A partition is part of the same table.', 'A partition is a set of rows, not a column. chart_date is the column that defines the slices.'],
        why: 'A partition is the set of rows that share one value of the partition key. Whether it is also stored separately depends on the engine and on how the table was created.' },
      { k: 'mc', ref: false, q: '🛒 Shop: a BigQuery orders table is partitioned by order_date. A report asks only for 2026-10-17. What does partitioning give you?', o: ['the query reads only the 10-17 partition instead of every day (partition pruning)', 'the orders of 10-17 are copied into a new table', 'orders from other days are deleted', 'nothing, because partitions are only a name for a WHERE filter'],
        w: [null, 'Pruning reads the stored partition in place; nothing is copied.', 'Partitioning never deletes data.', 'In DuckDB, where your table is one unpartitioned table, a date slice is only a WHERE filter. In a warehouse table declared as partitioned, the dates are stored apart and unneeded ones are skipped.'],
        why: 'Physical partitions let the engine skip the days a query does not ask for, which saves time and money on large tables.' }
    ] },
  etl4: {
    tables: { raw_tracks: ILT('raw_tracks', ['track_id', 'title', 'loaded_at'], [[1, 'Rush', '08:00'], [1, 'Rush', '09:00'], [2, 'Essence', '08:00']]) },
    scenes: [
      { h: 'A quality check that should return zero rows', fig: 'flow', say: 'This uniqueness check groups <code>raw_tracks</code> by its key, <code>track_id</code>, and keeps only the keys that appear more than once. On a healthy table the check returns <b>no rows</b>. Here it returns track 1, which was loaded twice (at 08:00 and at 09:00).',
        sql: 'SELECT track_id, COUNT(*) AS n\nFROM raw_tracks\nGROUP BY track_id\nHAVING COUNT(*) > 1;', ins: [{ t: 'raw_tracks', m: ['g0', 'g0', 'x'] }],
        out: { c: ['track_id', 'n'], r: [[1, 2]], m: ['g0'], nc: [1] } },
      { h: 'Dedupe: keep the latest row per key', fig: 'flow', say: 'To remove the duplicate, ROW_NUMBER numbers the rows of each track_id from the newest load to the oldest. Keeping only the rows where rn = 1 leaves one row per track: the latest one.',
        sql: 'WITH r AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY track_id ORDER BY loaded_at DESC) AS rn\n  FROM raw_tracks\n)\nSELECT track_id, title, loaded_at FROM r WHERE rn = 1;', ins: [{ t: 'raw_tracks', m: ['x', 'g0', 'g1'] }],
        out: { c: ['track_id', 'title', 'loaded_at'], r: [[1, 'Rush', '09:00'], [2, 'Essence', '08:00']], m: ['g0', 'g1'] } }
    ],
    qs: [{ k: 'tap', q: 'Tap the rows the dedupe keeps.', t: 'raw_tracks', ans: [1, 2], why: 'One row per track_id, the latest load: Rush 09:00 and Essence 08:00.' }] },
  pj3: {
    tables: {},
    scenes: [
      { h: 'Flattening: nested JSON → one row per track', fig: 'flow', say: 'The API returns one nested JSON document. transform.py walks through its <code>tracks</code> list and turns each track into one flat row with one value per column. The order of the list becomes the chart position, so the first track is position 1.',
        code: 'for position, t in enumerate(payload["tracks"], start=1):\n    rows.append({"chart_date": payload["chart_date"], "position": position,\n                 "title": t["title"].strip(), "artist": t["artist"]["name"]})',
        ins: [{ raw: '{"chart_date": "2026-10-17",\n "tracks": [\n   {"title": "Rush ", "artist": {"name": "Ayra Starr"}},\n   {"title": "Calm Down", "artist": {"name": "Rema"}}\n ]}', role: 'raw JSON (one document)' }],
        out: { c: ['chart_date', 'position', 'title', 'artist'], r: [['2026-10-17', 1, 'Rush', 'Ayra Starr'], ['2026-10-17', 2, 'Calm Down', 'Rema']], m: ['n', 'n'] }, lg: { n: '＋ one row per track' } }
    ],
    qs: [{ k: 'mc', q: 'The JSON has 50 tracks. How many rows does the flattening produce?', o: ['50', '1', '9', '450'], why: 'One row per track. (9 is the number of keys, i.e. columns, per row.)' }] },
  pj4: {
    tables: { chart_entries: ILT('chart_entries', ['chart_date', 'track_id', 'title'], [['10-16', 1, 'Rush'], ['10-17', 1, 'Rush'], ['10-17', 2, 'Calm Down']], 'CREATE TABLE chart_entries (chart_date, track_id, title, PRIMARY KEY (chart_date, track_id));'),
      batch: ILT('batch', ['chart_date', 'track_id', 'title'], [['10-17', 1, 'Rush'], ['10-17', 2, 'Calm Down'], ['10-17', 3, 'Charm']]) },
    scenes: [
      { h: 'The primary key refuses a duplicate load', fig: 'flow', say: 'In <code>chart_entries</code> the primary key is <code>(chart_date, track_id)</code>, so a track can appear only once per day: that is the table’s grain. The batch tries to insert the 10-17 rows again. Because those keys already exist, the database refuses the insert instead of silently storing duplicates.',
        sql: 'INSERT INTO chart_entries SELECT * FROM batch;', ins: [{ t: 'chart_entries', role: 'chart_entries (PK chart_date, track_id)' }, { t: 'batch', m: ['d', 'd', 'n'], role: 'rerun batch for 10-17' }],
        out: { err: 'UNIQUE constraint failed' }, lg: { d: '2× key already exists' } },
      { h: 'load.py: delete the date, then insert', fig: 'flow', say: 'This is what load.py does. It first deletes every <code>chart_entries</code> row for the run date, 10-17, and then inserts the fresh batch, which now also contains Charm, a song that arrived late. The 10-16 rows are not touched, and running it again gives the same table.',
        sql: "DELETE FROM chart_entries WHERE chart_date = '10-17';\nINSERT INTO chart_entries SELECT * FROM batch;\nSELECT * FROM chart_entries;", ins: [{ t: 'chart_entries', m: ['m', 'x', 'x'] }, { t: 'batch', m: ['n', 'n', 'n'] }],
        out: { c: ['chart_date', 'track_id', 'title'], r: [['10-16', 1, 'Rush'], ['10-17', 1, 'Rush'], ['10-17', 2, 'Calm Down'], ['10-17', 3, 'Charm']], m: ['m', 'n', 'n', 'n'] }, lg: { x: '✕ deleted first', n: '＋ inserted' } }
    ],
    qs: [{ k: 'mc', q: 'After delete-then-insert for 10-17, how many rows does chart_entries have?', o: ['4', '6', '3', '5'], why: '1 untouched 10-16 row + the 3 batch rows for 10-17.' }] },
  pj5: {
    tables: { chart_entries: ILT('chart_entries', ['chart_date', 'track_id', 'title', 'artist', 'position'], [['10-16', 1, 'Rush', 'Ayra Starr', 2], ['10-17', 1, 'Rush', 'Ayra Starr', 1], ['10-16', 2, 'Calm Down', 'Rema', 1], ['10-17', 2, 'Calm Down', 'Rema', 3], ['10-17', 3, 'Charm', 'Rema', 2]]) },
    scenes: [
      { h: 'chart_movement keeps every row, adds columns', fig: 'flow', say: 'The view chart_movement reads <code>chart_entries</code> and adds two columns. <code>prev_position</code> uses LAG within each track_id to fetch the track’s position on its previous chart day, and <code>places_gained</code> subtracts today’s position from it. 5 rows go in and 5 come out. Charm is a new entry with no previous row, so both new columns are NULL for it.',
        sql: 'SELECT chart_date, title, position,\n  LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) AS prev_position,\n  LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) - position AS places_gained\nFROM chart_entries;', ins: [{ t: 'chart_entries', m: ['g0', 'g0', 'g1', 'g1', 'g2'] }],
        out: { c: ['chart_date', 'title', 'position', 'prev_position', 'places_gained'], r: [['10-16', 'Rush', 2, null, null], ['10-17', 'Rush', 1, 2, 1], ['10-16', 'Calm Down', 1, null, null], ['10-17', 'Calm Down', 3, 1, -2], ['10-17', 'Charm', 2, null, null]], m: ['g0', 'g0', 'g1', 'g1', 'g2'], nc: [3, 4] } },
      { h: 'artist_summary collapses to one row per artist', fig: 'flow', say: 'The view artist_summary groups <code>chart_entries</code> by artist, so 5 rows become 2. COUNT(DISTINCT track_id) counts different songs, not chart days, which is why Ayra Starr has 1 song even though Rush appears on two days.',
        sql: 'SELECT artist, COUNT(DISTINCT track_id) AS songs_charted, MIN(position) AS best_position\nFROM chart_entries\nGROUP BY artist;', ins: [{ t: 'chart_entries', m: ['g0', 'g0', 'g1', 'g1', 'g1'] }],
        out: { c: ['artist', 'songs_charted', 'best_position'], r: [['Ayra Starr', 1, 1], ['Rema', 2, 1]], m: ['g0', 'g1'], nc: [1, 2] },
        note: 'Your project groups by the artist <b>name</b> because transform.py keeps only the name from the API, not Deezer\u2019s artist ID. Two different artists with the same name would be merged into one row. In a modelled warehouse you would store an artist_id and group by it.' }
    ],
    qs: [
      { k: 'mc', q: 'What is <code>places_gained</code> for Charm on 10-17?', o: ['NULL: it is a new entry with no previous position', '0', '2', '-2'], why: 'prev_position is NULL, and NULL − 2 is NULL.' },
      { k: 'mc', q: 'chart_movement vs artist_summary: how many rows each, from these 5 rows?', o: ['5 and 2', '2 and 5', '5 and 5', '3 and 2'], why: 'Window functions keep rows; GROUP BY collapses them.' }
    ] }
};
// a before/after figure for building blocks (grounding) as well
const ILL_COND = { h: '', fig: 'flow', sql: 'SELECT song_id, streams\nFROM daily_streams\nWHERE streams > 800;', norun: true,
  ins: [{ tab: ILT('daily_streams', ['chart_date', 'song_id', 'streams'], [['10-17', 1, 900], ['10-17', 2, 1200], ['10-17', 3, 700]]), m: ['m', 'm', 'x'], role: 'Before: table daily_streams', why: ['900 > 800 is TRUE', '1200 > 800 is TRUE', '700 > 800 is FALSE'] }],
  out: { c: ['song_id', 'streams'], r: [[1, 900], [2, 1200]], m: ['m', 'm'], why: ['kept: song 1', 'kept: song 2'] }, lg: { m: '✓ condition TRUE: kept', x: '✕ condition FALSE: dropped' } };

/* v7: entities, state, events, relationships (before joins) and many-to-many (after joins) */
const ERD_ART = { n: 'artists', cols: [['artist_id', 'PK'], ['name'], ['current_label']] };
const ERD_SNG = { n: 'songs', cols: [['song_id', 'PK'], ['title'], ['artist_id', 'FK']] };
const ERD_LIS = { n: 'listeners', cols: [['listener_id', 'PK'], ['name']] };
const ERD_STR = { n: 'streams', sub: 'events', cols: [['stream_id', 'PK'], ['listener_id', 'FK'], ['song_id', 'FK'], ['streamed_at']] };
const ERD_L_SA = { f: ['songs', 'artist_id'], t: ['artists', 'artist_id'] };
const ERD_L_SL = { f: ['streams', 'listener_id'], t: ['listeners', 'listener_id'] };
const ERD_L_SS = { f: ['streams', 'song_id'], t: ['songs', 'song_id'] };
const erdAt = (o, x, y, more) => Object.assign({}, o, { x, y }, more || {});
ILLUS.sqlr = {
  tables: {
    songs_flat: ILT('songs_flat', ['title', 'artist', 'artist_label'], [['Last Last', 'Burna Boy', 'Spaceship'], ["It's Plenty", 'Burna Boy', 'Spaceship'], ['City Boys', 'Burna Boi', 'Spaceship'], ['Free Mind', 'Tems', 'RCA'], ['Me & U', 'Tems', 'RCA']]),
    artists: ILT('artists', ['artist_id', 'name', 'current_label'], [[1, 'Burna Boy', 'Spaceship'], [2, 'Tems', 'RCA'], [3, 'Asake', 'YBNL']]),
    payments: ILT('payments', ['payment_id', 'account_id', 'amount', 'corrects'], [[1, 7, 5000, null], [2, 7, 5000, null], [3, 7, -5000, 2]]),
    songs: ILT('songs', ['song_id', 'title', 'artist_id'], [[10, 'Last Last', 1], [11, 'Free Mind', 2], [12, 'Joha', 3], [13, 'City Boys', 1]]),
    listeners: ILT('listeners', ['listener_id', 'name'], [[100, 'Ada'], [101, 'Tunde'], [102, 'Zainab']]),
    streams: ILT('streams', ['stream_id', 'listener_id', 'song_id', 'streamed_at'], [[1, 100, 10, '21:14'], [2, 100, 11, '21:18'], [3, 101, 10, '22:02']])
  },
  scenes: [
    { h: 'One big table repeats itself',
      say: 'Imagine keeping everything in one table, <code>songs_flat</code>. Each row is a song, but it also <b>copies</b> the artist\u2019s name and, in <code>artist_label</code>, the record label the artist is currently signed to. Burna Boy\u2019s label is written 3 times and Tems\u2019 twice. Every copy is a chance for the data to disagree.',
      ins: [{ t: 'songs_flat', m: ['d', 'd', 'd', 'd', 'd'], role: 'one big table (a deliberately bad design)' }], lg: { d: 'artist and label copied again' },
      note: 'Look closely at row 3: "Burna Boi". The next two pictures show why copies hurt.' },
    { h: 'Problem 1: an update misses copies',
      say: 'Imagine Burna Boy signs with a new label, Atlantic (the labels in this lesson are made-up examples). Someone updates <b>one</b> row of <code>songs_flat</code>. The other two copies still say Spaceship, so the table now gives two different answers to "which label is Burna Boy signed to now?".',
      sql: "UPDATE songs_flat SET artist_label = 'Atlantic'\nWHERE title = 'Last Last';\nSELECT title, artist, artist_label FROM songs_flat\nWHERE artist LIKE 'Bur%';",
      ins: [{ t: 'songs_flat', m: ['n', 'u', 'u'], role: 'one big table (a deliberately bad design)' }],
      out: { c: ['title', 'artist', 'artist_label'], r: [['Last Last', 'Burna Boy', 'Atlantic'], ["It's Plenty", 'Burna Boy', 'Spaceship'], ['City Boys', 'Burna Boi', 'Spaceship']], m: ['n', 'u', 'u'] },
      lg: { n: 'updated', u: 'missed copy: now the data disagrees' } },
    { h: 'Problem 2: a typo invents an artist',
      say: 'Now ask <code>songs_flat</code> for its distinct artists. Because the name is typed again on every row, the one typo in row 3 ("Burna Boi") shows up as an extra artist who does not exist.',
      sql: 'SELECT DISTINCT artist, artist_label\nFROM songs_flat;',
      ins: [{ t: 'songs_flat', m: ['m', 'm', 'u', 'm', 'm'], role: 'one big table (a deliberately bad design)' }],
      out: { c: ['artist', 'artist_label'], r: [['Burna Boy', 'Spaceship'], ['Burna Boi', 'Spaceship'], ['Tems', 'RCA']], m: ['m', 'u', 'm'] },
      lg: { m: 'real artist', u: 'typo = a fake extra artist' } },
    { h: 'The fix: split it so each fact lives once',
      say: 'The fix is to give artists their own table, <code>artists</code>, with one row and one ID per artist. The <code>songs</code> table keeps only the artist\u2019s <b>ID</b> in <code>artist_id</code>, so the repetition disappears. If Burna Boy changes label, that is now <b>one</b> UPDATE to <code>artists.current_label</code>, and a song cannot point at "Burna Boi" because it stores the number 1, not a typed name.',
      ins: [{ t: 'songs_flat', m: ['d', 'd', 'd', 'd', 'd'], role: 'before: copies everywhere (a deliberately bad design)' }],
      after: [{ t: 'artists', m: ['n', 'n', 'n'], role: 'artists: each artist\u2019s current label stored once' }, { t: 'songs', role: 'songs: point at the artist by ID' }],
      lg: { d: 'copied fact', n: 'stored once' } },
    { h: 'Entities: things that exist on their own', fig: 'ent',
      say: 'An <b>entity</b> is a thing that exists by itself and that we store facts about. Artists, songs and listeners exist whether or not anything happens today. Each entity gets <b>its own table</b> and <b>its own ID</b> (the primary key).' },
    { h: 'State: a fact that changes and gets overwritten', fig: 'state', fp: { who: 'Burna Boy · current_label', vals: [['last week', 'Spaceship'], ['today', 'Atlantic']] },
      say: '<b>State</b> is a current fact about an entity, such as the label an artist is signed to <i>now</i> or a listener\u2019s current city. It lives in a column, here <code>artists.current_label</code>. When it changes we UPDATE that one row, and the old value is <b>gone</b> unless we deliberately keep history.',
      sql: "UPDATE artists SET current_label = 'Atlantic'\nWHERE artist_id = 1;\nSELECT * FROM artists;",
      ins: [{ t: 'artists', m: ['n'], role: 'before' }],
      out: { c: ['artist_id', 'name', 'current_label'], r: [[1, 'Burna Boy', 'Atlantic'], [2, 'Tems', 'RCA'], [3, 'Asake', 'YBNL']], m: ['n', '', ''] },
      lg: { n: 'same row, value overwritten ("Spaceship" is lost)' } },
    { h: 'A song\u2019s label is a different fact', fig: 'flow',
      say: 'There are really two label facts, and the "more than one value?" test separates them. Can one artist have more than one label? Over a career, yes: in this made-up example Last Last came out on Spaceship and City Boys on Atlantic. So the label a song was <b>released on</b> is a fact about the release, and it is stored with the song in <code>songs.release_label</code>. It stays true when the artist moves. <code>artists.current_label</code> is a different fact: who the artist is signed to today, which is state.',
      ins: [{ tab: ILT('artists', ['artist_id', 'name', 'current_label'], [[1, 'Burna Boy', 'Atlantic']]), m: ['n'], role: 'artists.current_label: who the artist is signed to now (state)' }],
      after: [{ tab: ILT('songs', ['song_id', 'title', 'artist_id', 'release_label'], [[10, 'Last Last', 1, 'Spaceship'], [13, 'City Boys', 1, 'Atlantic']]), m: ['m', 'm'], role: 'songs.release_label: the label each song came out on (a fact about that release)' }],
      lg: { n: 'state: overwritten when the artist moves', m: 'release fact: does not change' },
      note: 'If one song can come out on several labels (for example a different label in each country), that is "more than one value" again, so it gets its own table, such as <code>song_releases(song_id, country, label)</code>.' },
    { h: 'Events: things that happen, one new row each', fig: 'events', fp: [['21:14', '🎧 Ada ▶ Last Last'], ['21:18', '🎧 Ada ▶ Free Mind'], ['22:02', '🎧 Tunde ▶ Last Last']],
      say: 'An <b>event</b> is something that happened at a moment. The table <code>streams</code> records each play as a <b>new row</b> holding the time and the IDs of the entities involved: who listened (<code>listener_id</code>) and to which song (<code>song_id</code>). Once a row is recorded, it is normally not edited. The next picture shows what happens when an event row is wrong.',
      sql: 'SELECT * FROM streams\nORDER BY streamed_at;', ordered: true,
      out: { c: ['stream_id', 'listener_id', 'song_id', 'streamed_at'], r: [[1, 100, 10, '21:14'], [2, 100, 11, '21:18'], [3, 101, 10, '22:02']], m: ['n', 'n', 'n'] },
      lg: { n: 'one new row per event' } },
    { h: 'A wrong event is fixed by a correction', fig: 'flow',
      say: 'Mistakes still happen, so event tables need a way to fix them. In the table <code>payments</code>, account 7 was charged 5000 twice by mistake (payment 2). The standard fix is to <b>add a correcting event</b>: payment 3 has amount −5000, and its <code>corrects</code> column points at payment 2. The history still shows what happened and how it was fixed, and the sum below gives the right balance.',
      sql: 'SELECT account_id, SUM(amount) AS balance\nFROM payments\nGROUP BY account_id;',
      ins: [{ t: 'payments', m: ['m', 'u', 'n'], role: 'payments: an event table (one row per money movement)' }],
      out: { c: ['account_id', 'balance'], r: [[7, 5000]], m: ['m'] },
      lg: { u: 'the mistaken event (kept, not edited)', n: '＋ the correcting event', m: '✓ counted' },
      note: 'Some systems instead allow a <b>controlled update</b>, such as a logged fix made by an authorised job, but never a silent rewrite. Events can also arrive <b>late</b>: a stream played at 23:59 may reach the pipeline the next morning, and it is simply added as a new row then.' },
    { h: 'Relationships: stored as keys, or created by events', fig: 'bip',
      fp: { lt: 'listeners', rt: 'songs', l: ['Ada', 'Tunde', 'Zainab'], r: ['Last Last', 'Free Mind', 'Joha'], e: [[0, 0, 'd'], [0, 1, 'd'], [1, 0, 'd']],
        cap: 'Dashed lines exist <b>only because a stream happened</b>. Each one is a row in <code>streams</code>. Zainab has streamed nothing, so she has <b>no link</b> to any song yet. Compare that with "Last Last\u2019s main artist is Burna Boy": it is a fact about the song, stored once in <code>songs.artist_id</code>.' },
      say: 'A <b>relationship</b> is how entities connect. Some are <b>facts stored as a foreign key</b>: each song points at its main artist through <code>songs.artist_id</code>. Others are <b>created by events</b>: a listener and a song are unrelated until a stream happens, and then that row in <code>streams</code> <i>is</i> the link. The picture shows the second kind as dashed lines.' },
    { h: 'Keys: the arrow from one table to another', fig: 'erd',
      fp: { boxes: [erdAt(ERD_ART, 6, 6), erdAt(ERD_SNG, 214, 6)], links: [ERD_L_SA], label: 'songs.artist_id points to artists.artist_id' },
      say: 'The <b>primary key</b> (PK) identifies each row in its own table; in <code>artists</code> it is <code>artist_id</code>. A <b>foreign key</b> (FK) is a column that holds values of another table’s key: <code>songs.artist_id</code> holds artist_id values from artists. The diagram draws that link as an arrow from the FK to the PK. The query below follows the arrow by hand for one song, Last Last, whose artist_id is 1.',
      sql: "SELECT name FROM artists\nWHERE artist_id = 1;  -- Last Last's artist_id",
      out: { c: ['name'], r: [['Burna Boy']], m: ['m'] }, lg: { m: 'the row the arrow points at' } },
    { h: 'Three kinds of relationship', fig: 'kinds',
      say: 'Each picture below joins rows of one table to rows of another. For each line, count how many rows can sit at each end: one or many. That count tells you which kind of relationship it is, and therefore where the foreign key goes.' },
    { h: 'The ERD: what can join to what', fig: 'erd',
      fp: { boxes: [erdAt(ERD_ART, 6, 6, { hl: 1 }), erdAt(ERD_SNG, 214, 6, { hl: 1 }), erdAt(ERD_LIS, 6, 102, { hl: 1 }), erdAt(ERD_STR, 214, 102, { hl: 1 })],
        links: [Object.assign({ hl: 1 }, ERD_L_SA), Object.assign({ hl: 1 }, ERD_L_SL), Object.assign({ hl: 1 }, ERD_L_SS)], label: 'ERD of artists, songs, listeners and streams',
        cap: 'To get from a listener to an artist you follow the lines: from <code>listeners</code> to <code>streams</code>, then to <code>songs</code>, then to <code>artists</code>. There is <b>no line</b> between listeners and artists, because they share no ID, so they cannot be joined directly.' },
      say: 'An <b>ERD</b> (entity-relationship diagram) draws every table as a box and every foreign-key link as a line between the foreign key and the key it points at. The crow’s foot marks the <b>many</b> end of each line. Tables can only be joined meaningfully along these lines, because each line is a shared ID.' }
  ],
  qs: [
    { k: 'cls', q: 'Sort each one: entity, state, event or relationship?', cats: ['Entity', 'State', 'Event', 'Relationship'],
      items: [['Burna Boy (an artist)', 0], ['Ada currently lives in Lagos', 1], ['Ada streamed Last Last at 21:14', 2], ['Last Last belongs to Burna Boy', 3], ['Tems is signed to RCA (for now)', 1], ['a listener', 0]],
      why: 'Artists and listeners exist on their own (entities). A current city and a current label are changeable facts (state). A stream happened at a moment (event). "Belongs to" connects two entities (relationship).' },
    { k: 'mc', q: 'Which tables connect <b>listeners</b> to <b>artists</b>?', o: ['streams, then songs', 'none: join listeners to artists directly', 'playlists only', 'artists already has a listener_id'],
      why: 'listeners and artists share no column, so you go through the tables that do: join listeners to streams on listener_id, streams to songs on song_id, and songs to artists on artist_id.' },
    { k: 'tapc', q: 'Tap the <b>foreign key</b> column in songs.', t: 'songs', ans: [2],
      why: '<code>songs.artist_id</code> holds values of another table\u2019s primary key (<code>artists.artist_id</code>). <code>song_id</code> is songs\u2019 own primary key.' },
    { k: 'mc', q: 'An artist has many songs, and each song has one main artist. Which kind of relationship is that?', o: ['one-to-many', 'one-to-one', 'many-to-many', 'no relationship'],
      why: 'One artist row, many song rows. The FK sits on the many side (songs). Featured artists are a separate, many-to-many relationship with its own linking table.' },
    { k: 'mc', q: 'Which pair can <b>not</b> be joined directly?', o: ['listeners and artists', 'songs and artists', 'streams and songs', 'streams and listeners'],
      why: 'listeners and artists share no ID and no line joins them in the ERD. You have to go through streams and songs.' },
    { k: 'mc', q: 'What goes wrong with the one big table?', o: ['a change must be repeated on every copy, and one typo creates a fake artist', 'nothing: one table is always best', 'SQL cannot read tables with text', 'it can only hold 5 rows'],
      why: 'Repeated facts give update problems (missed copies) and typo problems (Burna Boi). Splitting stores each fact once.' },
    { k: 'tap', q: 'Tap the listeners who are linked to at least one song.', t: 'listeners', ans: [0, 1],
      why: 'Ada and Tunde have stream rows. Zainab has none, so no link exists yet.' },
    { k: 'mc', q: 'Zainab has never streamed anything. Is she related to any song?', o: ['No: the link only appears when a stream event is stored', 'Yes, to every song', 'Yes, through artists', 'Yes, through a listener_id in songs'],
      why: 'Listener–song links are created by events. No stream row means no link.' },
    { k: 'mc', q: 'Ada streams Last Last again tomorrow. What happens in streams?', o: ['a new row is added and old rows stay unchanged', 'row 1 gets the new time', 'nothing: she already has that link', 'the songs row is updated'],
      why: 'Every play is a new event row, and the earlier rows stay as they were. That is why Ada can appear with the same song many times.' },
    { k: 'mc', q: 'After <code>UPDATE artists SET current_label = \'Atlantic\' WHERE artist_id = 1</code>, where is "Spaceship"?', o: ['gone from artists, unless history was kept on purpose', 'in a second row for Burna Boy', 'in the streams table', 'still in the current_label column next to Atlantic'],
      why: 'State is overwritten. To keep the old value you need a history table (or a slowly changing dimension). A label stored on each song as <code>release_label</code> would not be affected, because it is a different fact.' },
    { k: 'mc', ref: false, q: 'Burna Boy moved from Spaceship to Atlantic. Where should "Last Last came out on Spaceship" be stored?', o: ['with the song (songs.release_label), because it is a fact about that release', 'in artists.current_label, which now says Atlantic', 'nowhere: an artist only ever has one label', 'in artists.current_label as "Spaceship, Atlantic"'],
      w: [null, 'current_label is state: it was overwritten by the move, so it can no longer tell you what Last Last came out on.', 'This was the simplified version. Over a career an artist can have several labels, so a label is not one fixed fact about the artist.', 'Two values in one cell cannot be checked or joined, and it still does not say which song came out on which label.'],
      why: 'Ask "can there be more than one?". One artist can have several labels over time, but one release has one label, so the release label is stored with the song.' },
    { k: 'mc', ref: false, q: 'A bug logged one of Ada\u2019s streams twice. What is the standard fix in an event table?', o: ['record a correction (for example a row that cancels the duplicate), or make a controlled, logged fix', 'nothing: events can never change, so the duplicate must stay and be counted', 'quietly edit the old rows so nobody sees the mistake', 'delete Ada from listeners'],
      w: [null, 'This was the simplified rule. Events are not edited in normal use, but wrong events are corrected; otherwise every count would stay wrong.', 'A silent rewrite destroys the history and makes later numbers impossible to explain or audit.', 'Ada is an entity and did nothing wrong. The problem is one duplicated event row.'],
      why: 'Events are recorded once and normally not edited. Mistakes are fixed deliberately and traceably: a correcting row, or a controlled update.' },
    { k: 'mc', ref: false, q: '🏦 Bank: a customer was charged ₦5,000 twice by mistake. What does a well-designed transactions table do?', o: ['add a reversal of −₦5,000 that points at the wrong charge', 'change the wrong charge to ₦0 and keep no record', 'delete both charges', 'only change the balance shown on the account'],
      w: [null, 'The money did move, and then moved back. Changing the amount silently hides that, and the statement no longer matches what happened.', 'Deleting removes the correct charge too, and any record of the error.', 'The balance should be computed from the transactions. Editing only the balance makes the two disagree.'],
      why: 'Ledgers keep every transaction and fix mistakes with a correcting entry. The sum of the rows is then right, and the history explains it.' },
    { k: 'mc', ref: false, q: '🏥 Hospital: Dr Bello now works at Lagos General, but last year she did an operation at Ikeja Clinic. Where is "the operation was at Ikeja Clinic" stored?', o: ['on the operation\u2019s own row (operations.hospital_id)', 'in doctors.current_hospital', 'in doctors.current_hospital as "Ikeja Clinic, Lagos General"', 'nowhere: a doctor has one hospital'],
      w: [null, 'That is state: it now says Lagos General, so it cannot tell you where last year\u2019s operation happened.', 'A list in one cell cannot be checked or joined, and it does not say which operation was where.', 'A doctor can work at several hospitals over time, so "one hospital per doctor" is only true today.'],
      why: 'Where one operation happened is a fact about that operation, just as the release label is a fact about the song. The doctor\u2019s current hospital is separate state.' },
    { k: 'run', q: 'Follow the arrow: song 12 (Joha) has artist_id 3. Fill in the ____ to get its artist\u2019s name.', code: 'SELECT name FROM artists\nWHERE artist_id = ____;', sol: 'SELECT name FROM artists WHERE artist_id = 3;',
      why: 'A foreign key is just the other table\u2019s ID. Looking it up by hand is exactly what a JOIN does for every row at once.' }
  ]
};
ILLUS.sqlm = {
  tables: {
    listeners: ILT('listeners', ['listener_id', 'name'], [[100, 'Ada'], [101, 'Tunde'], [102, 'Zainab']]),
    streams: ILT('streams', ['stream_id', 'listener_id', 'song_id'], [[1, 100, 10], [2, 100, 11], [3, 101, 10], [4, 101, 12]]),
    songs: ILT('songs', ['song_id', 'title'], [[10, 'Last Last'], [11, 'Free Mind'], [12, 'Joha']]),
    playlists: ILT('playlists', ['playlist_id', 'name'], [[1, 'Naija Hits'], [2, 'Chill']]),
    playlist_songs: ILT('playlist_songs', ['playlist_id', 'song_id'], [[1, 10], [1, 12], [2, 11], [2, 10]])
  },
  scenes: [
    { h: 'Many on both sides: no single FK fits', fig: 'bip',
      fp: { lt: 'listeners', rt: 'songs', l: ['Ada', 'Tunde', 'Zainab'], r: ['Last Last', 'Free Mind', 'Joha'], e: [[0, 0], [0, 1], [1, 0], [1, 2]],
        cap: 'Ada has 2 songs, and Last Last has 2 listeners. A column <code>listeners.song_id</code> could hold only <b>one</b> song, so the pairs get their own table.' },
      say: 'Listeners and songs are <b>many-to-many</b>: Ada has played 2 songs, and Last Last has 2 listeners. Each line in the picture becomes <b>one row</b> in a linking table, and here that table is <code>streams</code>.',
      ins: [{ t: 'streams', role: 'streams: one row per line above' }] },
    { h: 'Join 1: streams → listeners', fig: 'flow',
      say: 'Start from the linking table, <code>streams</code>, and follow one arrow: <code>streams.listener_id</code> points at <code>listeners.listener_id</code>. The join gives each stream its listener’s name. Zainab has no rows in streams, so nothing points at her and she does not appear.',
      sql: 'SELECT st.stream_id, l.name, st.song_id\nFROM streams st\nJOIN listeners l\n  ON l.listener_id = st.listener_id;',
      ins: [{ t: 'streams', m: ['g0', 'g0', 'g1', 'g1'], role: 'linking table (FROM)' }, { t: 'listeners', m: ['g0', 'g1', 'x'], role: 'JOIN ➡' }],
      out: { c: ['stream_id', 'name', 'song_id'], r: [[1, 'Ada', 10], [2, 'Ada', 11], [3, 'Tunde', 10], [4, 'Tunde', 12]], m: ['g0', 'g0', 'g1', 'g1'] },
      lg: { g: 'colour = same listener', x: 'no stream points here' } },
    { h: 'Join 2: … → songs. Two joins, one per arrow', fig: 'flow',
      say: 'Now add the second arrow: <code>streams.song_id</code> points at <code>songs.song_id</code>. With both joins, each result row reads “this listener played this song”. The result has <b>one row per stream</b> (4 rows), not one per listener.',
      sql: 'SELECT l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s     ON s.song_id = st.song_id;',
      ins: [{ t: 'listeners', m: ['g0', 'g1', 'x'], role: 'listeners' }, { t: 'streams', m: ['g0', 'g0', 'g1', 'g1'], role: 'streams (the link)' }, { t: 'songs', m: ['m', 'm', 'm'], role: 'songs' }],
      out: { c: ['name', 'title'], r: [['Ada', 'Last Last'], ['Ada', 'Free Mind'], ['Tunde', 'Last Last'], ['Tunde', 'Joha']], m: ['g0', 'g0', 'g1', 'g1'] },
      lg: { g: 'colour = same listener', x: 'no streams: dropped by INNER JOIN' } },
    { h: 'Read it the other way round', fig: 'flow',
      say: 'The same linking table also answers “who played this song?”. This query joins <code>streams</code> to <code>songs</code> and groups by the song’s key, <code>song_id</code>, showing the title next to it. Last Last has 2 listeners, and the other two songs have 1 each.',
      sql: 'SELECT s.title, COUNT(*) AS listeners\nFROM streams st\nJOIN songs s ON s.song_id = st.song_id\nGROUP BY s.song_id, s.title;',
      ins: [{ t: 'streams', m: ['g0', 'g1', 'g0', 'g2'], role: 'streams' }, { t: 'songs', m: ['g0', 'g1', 'g2'], role: 'songs' }],
      out: { c: ['title', 'listeners'], r: [['Last Last', 2], ['Free Mind', 1], ['Joha', 1]], m: ['g0', 'g1', 'g2'], nc: [1] },
      lg: { g: 'colour = same song' } },
    { h: 'Same pattern: songs on playlists', fig: 'erd',
      fp: { boxes: [{ n: 'playlists', x: 6, y: 6, cols: [['playlist_id', 'PK'], ['name']] }, { n: 'playlist_songs', sub: 'link', x: 214, y: 6, cols: [['playlist_id', 'PK FK'], ['song_id', 'PK FK']] }, { n: 'songs', x: 6, y: 80, cols: [['song_id', 'PK'], ['title']] }],
        links: [{ f: ['playlist_songs', 'playlist_id'], t: ['playlists', 'playlist_id'] }, { f: ['playlist_songs', 'song_id'], t: ['songs', 'song_id'] }], label: 'playlists and songs through playlist_songs' },
      say: 'A song can be on many playlists, and a playlist holds many songs. The linking table <code>playlist_songs</code> holds one row per pair. Its primary key is the pair itself, so the same song cannot be added to a playlist twice.',
      sql: "SELECT p.name AS playlist, s.title\nFROM playlist_songs ps\nJOIN playlists p ON p.playlist_id = ps.playlist_id\nJOIN songs s     ON s.song_id = ps.song_id\nWHERE p.name = 'Naija Hits';",
      ins: [{ t: 'playlist_songs', m: ['m', 'm', 'x', 'x'], role: 'the link' }],
      out: { c: ['playlist', 'title'], r: [['Naija Hits', 'Last Last'], ['Naija Hits', 'Joha']], m: ['m', 'm'] },
      lg: { m: 'pair on Naija Hits', x: 'other playlist' } }
  ],
  qs: [
    { k: 'mc', q: 'How many rows does the two-join query return?', sql: 'SELECT l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s     ON s.song_id = st.song_id;',
      o: ['4: one per stream', '3: one per listener', '3: one per song', '9: every listener × every song'], why: 'The grain is the linking table: one row per stream. There are 4 streams.' },
    { k: 'tap', q: 'Tap the listeners who appear in that two-join result.', t: 'listeners', ans: [0, 1], why: 'Ada and Tunde have streams. Zainab has none, so the INNER JOIN drops her.' },
    { k: 'mc', q: 'Why is Zainab missing?', o: ['she has no stream rows, so INNER JOIN drops her (a LEFT JOIN from listeners would keep her with NULLs)', 'her name is too long', 'listeners is the wrong table', 'songs has no Zainab column'],
      why: 'No event, no link. Start FROM listeners and LEFT JOIN if you need everyone.' },
    { k: 'mc', q: 'Where is "Joha is on Naija Hits" stored?', o: ['a row (1, 12) in the linking table playlist_songs', 'a playlist column in songs', 'a song column in playlists', 'nowhere'],
      why: 'Many-to-many pairs live in the linking table, one row per pair.' },
    { k: 'run', q: 'Fill in the second join so each stream shows its song title.', code: 'SELECT l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s ON s.song_id = ____;',
      sol: 'SELECT l.name, s.title FROM streams st JOIN listeners l ON l.listener_id = st.listener_id JOIN songs s ON s.song_id = st.song_id;', why: 'The arrow runs from <code>streams.song_id</code> (FK) to <code>songs.song_id</code> (PK).' },
    { k: 'run', q: 'List the titles of the songs on the playlist Chill.', code: "SELECT s.title\nFROM playlist_songs ps\nJOIN playlists p ON p.playlist_id = ps.playlist_id\nJOIN songs s ON s.song_id = ____\nWHERE p.name = 'Chill';",
      sol: "SELECT s.title FROM playlist_songs ps JOIN playlists p ON p.playlist_id = ps.playlist_id JOIN songs s ON s.song_id = ps.song_id WHERE p.name = 'Chill';", why: 'Two joins through the linking table: one to playlists, one to songs. Chill has Free Mind and Last Last.' },
    { k: 'mc', q: 'What is the primary key of playlist_songs usually?', o: ['the pair (playlist_id, song_id)', 'playlist_id alone', 'song_id alone', 'the song title'],
      why: 'The pair is unique, so a song cannot be added to the same playlist twice. playlist_id alone would allow only one song per playlist.' }
  ]
};
/* v8: what's inside a table (before entities & relationships): anatomy, grain, where each column belongs, where the ID goes, blueprints, transfer */
const TBL_SONGS = ILT('songs', ['song_id', 'title', 'artist_id', 'duration_sec', 'genre'], [[1, 'Heaven Baby', 1, 159, 'Afrobeats'], [2, 'SLICK', 2, 106, 'Afrobeats'], [11, 'Goodbye (Warm Up)', 1, 163, 'Afrobeats']],
  'CREATE TABLE songs (song_id INTEGER PRIMARY KEY, title TEXT NOT NULL, artist_id INTEGER REFERENCES artists(artist_id), duration_sec INTEGER, genre TEXT);');
// blueprint cards for every practice table: [table, kind, grain, [[column, type, tag, why]], sample row]
const BLUEPRINTS = {
  artists: ['entity', 'one artist', [['artist_id', 'INTEGER', 'PK', 'identifies each artist; other tables point here'], ['name', 'TEXT', '', 'the artist\u2019s main stage name (other names go in artist_aliases, one row each)']], [1, 'Ayra Starr']],
  songs: ['entity', 'one song', [['song_id', 'INTEGER', 'PK', 'identifies each song'], ['title', 'TEXT', '', 'describes the song'], ['artist_id', 'INTEGER', 'FK', 'the main artist: a song has one main artist and an artist has many songs, so the ID sits here (the many side); featured artists would need a linking table'], ['duration_sec', 'INTEGER', '', 'describes the song'], ['genre', 'TEXT', '', 'one main genre per song (an artist can have several genres, so genre is not an artist column; waf has none yet: NULL)']], [14, 'Calm Down', 14, 239, 'Afrobeats']],
  listeners: ['entity', 'one listener', [['listener_id', 'INTEGER', 'PK', 'identifies each listener'], ['name', 'TEXT', '', 'describes the listener'], ['city', 'TEXT', '', 'describes the listener (state: changes if they move)']], [1, 'Ada', 'Lagos']],
  playlists: ['entity', 'one playlist', [['playlist_id', 'INTEGER', 'PK', 'identifies each playlist'], ['name', 'TEXT', '', 'describes the playlist']], [1, 'Naija Hits']],
  chart_entries: ['event', 'one song on one chart day', [['chart_date', 'TEXT', 'PK', 'which day (part of the key)'], ['position', 'INTEGER', '', 'exists only because of that day\u2019s chart'], ['song_id', 'INTEGER', 'PK FK', 'which song (part of the key, points at songs)'], ['streams', 'INTEGER', '', 'that song\u2019s count on that day']], ['2026-10-17', 1, 1, 108000]],
  streams: ['event', 'one play', [['stream_id', 'INTEGER', 'PK', 'identifies each play'], ['listener_id', 'INTEGER', 'FK', 'who played (the event holds everyone involved)'], ['song_id', 'INTEGER', 'FK', 'what was played'], ['streamed_at', 'TEXT', '', 'when it happened']], [1, 1, 14, '2026-10-17 21:14']],
  playlist_songs: ['link', 'one song on one playlist', [['playlist_id', 'INTEGER', 'PK FK', 'which playlist'], ['song_id', 'INTEGER', 'PK FK', 'which song; the pair is the key, so a song is on a playlist once']], [1, 14]]
};
const SHOP_ERD = { boxes: [{ n: 'customers', x: 6, y: 6, cols: [['customer_id', 'PK'], ['name'], ['email']] }, { n: 'orders', sub: 'event', x: 214, y: 6, cols: [['order_id', 'PK'], ['customer_id', 'FK'], ['ordered_at']] },
  { n: 'products', x: 6, y: 96, cols: [['product_id', 'PK'], ['name'], ['price']] }, { n: 'order_items', sub: 'event', x: 214, y: 96, cols: [['order_id', 'PK FK'], ['product_id', 'PK FK'], ['quantity'], ['price_paid']] }],
  links: [{ f: ['orders', 'customer_id'], t: ['customers', 'customer_id'] }, { f: ['order_items', 'order_id'], t: ['orders', 'order_id'] }, { f: ['order_items', 'product_id'], t: ['products', 'product_id'] }], label: 'shop ERD: customers, orders, order_items, products' };
const BAD = (n, c, r) => '<div class="lab">' + n + '</div><div class="ill-scroll bad">' + MT(c, r) + '</div>';
ILLUS.sqlt = {
  tables: {
    songs: TBL_SONGS,
    chart_wide: ILT('chart_wide', ['chart_date', 'position', 'title', 'artist', 'genre'], [['10-16', 1, 'Heaven Baby', 'Ayra Starr', 'Afrobeats'], ['10-16', 2, 'SLICK', 'Victony', 'Afrobeats'], ['10-17', 1, 'Heaven Baby', 'Ayra Starr', 'Afrobeats'], ['10-17', 2, 'SLICK', 'Victony', 'Afrobeats'], ['10-17', 3, 'Goodbye (Warm Up)', 'Ayra Starr', 'Afrobeats']]),
    artists: ILT('artists', ['artist_id', 'name'], [[1, 'Ayra Starr'], [2, 'Victony']]),
    artists_list: ILT('artists_list', ['artist_id', 'name', 'genres'], [[1, 'Ayra Starr', 'Afrobeats, R&B'], [2, 'Victony', 'Afrobeats']]),
    artists_dup: ILT('artists_dup', ['artist_id', 'name', 'genre'], [[1, 'Ayra Starr', 'Afrobeats'], [1, 'Ayra Starr', 'R&B'], [2, 'Victony', 'Afrobeats']]),
    chart_entries: ILT('chart_entries', ['chart_date', 'position', 'song_id'], [['10-16', 1, 1], ['10-16', 2, 2], ['10-17', 1, 1], ['10-17', 2, 2], ['10-17', 3, 11]]),
    listeners: ILT('listeners', ['listener_id', 'name', 'email'], [[100, 'Ada', 'ada@mail.ng'], [101, 'Tunde', null], [102, 'Zainab', null]]),
    artists_bad: ILT('artists_bad', ['artist_id', 'name', 'song_ids'], [[1, 'Ayra Starr', '1, 11'], [2, 'Victony', '2']])
  },
  scenes: [
    { h: 'The parts of a table', fig: 'anat',
      say: 'Here is the real <code>songs</code> table. Each number in the picture points at one part of it, and the key below the table names that part. Find each number in the key before moving on: the next pictures use these names.' },
    { h: 'The same table as a blueprint (the schema)', fig: 'ddl',
      say: 'The <b>schema</b> is the blueprint that existed before any row was added: the table name, each column\u2019s name and <b>data type</b>, and which columns are keys. This is how <code>songs</code> was created. The database can show you the blueprint itself:',
      sql: "SELECT name, type, pk\nFROM pragma_table_info('songs');", ordered: true,
      out: { c: ['name', 'type', 'pk'], r: [['song_id', 'INTEGER', 1], ['title', 'TEXT', 0], ['artist_id', 'INTEGER', 0], ['duration_sec', 'INTEGER', 0], ['genre', 'TEXT', 0]], m: ['m', '', '', '', ''] },
      lg: { m: 'pk = 1: the primary key' } },
    { h: 'A primary key is unique and never NULL', fig: 'flow',
      say: 'Which column of <code>listeners</code> could be its primary key? A primary key must be <b>unique</b> on every row and must <b>never be NULL</b>, because a row with a missing key cannot be identified. The query counts both things. <code>listener_id</code> has 3 different values in 3 rows and no gaps. <code>email</code> is missing for 2 listeners, so it cannot be the key, even though the one email that exists is unique.',
      sql: 'SELECT COUNT(*) AS row_count,\n  COUNT(DISTINCT listener_id) AS distinct_ids,\n  COUNT(*) - COUNT(email) AS missing_emails\nFROM listeners;',
      ins: [{ t: 'listeners', m: ['m', 'u', 'u'], role: 'listeners: listener_id is filled on every row; email is not' }],
      out: { c: ['row_count', 'distinct_ids', 'missing_emails'], r: [[3, 3, 2]], m: ['m'] },
      lg: { m: '✓ listener_id and email both filled', u: 'email is NULL (the row still has its own listener_id)' },
      note: 'Standard SQL forbids NULL in a primary key, and Postgres and DuckDB enforce it. SQLite, the engine in this app, has an old exception: it accepts NULL in a primary-key column unless that column is an <code>INTEGER PRIMARY KEY</code>, the table is <code>WITHOUT ROWID</code> or <code>STRICT</code>, or the column is also declared <code>NOT NULL</code>. That is why SQLite schemas often say <code>PRIMARY KEY NOT NULL</code>.' },
    { h: 'One row = one what? (the grain)',
      say: 'Before adding any column, say what <b>one row</b> stands for. In <code>songs</code> one row is <b>one song</b>. In <code>chart_entries</code> one row is <b>one song on one chart day</b>, so Heaven Baby (song 1) appears once per day:',
      sql: 'SELECT chart_date, position\nFROM chart_entries\nWHERE song_id = 1;',
      ins: [{ t: 'songs', m: ['m', '', ''], role: 'songs: one row = one song' }, { t: 'chart_entries', m: ['m', '', 'm', '', ''], role: 'chart_entries: one row = one song on one day' }],
      out: { c: ['chart_date', 'position'], r: [['10-16', 1], ['10-17', 1]], m: ['m', 'm'] }, lg: { m: 'Heaven Baby: once in songs, once per day in chart_entries' } },
    { h: 'Before: one wide table',
      say: 'Imagine one wide table for the chart. It works, but look at what is written on every row: the song\u2019s title and genre and the artist\u2019s name are <b>copied</b> each time the song charts. "Ayra Starr" is stored 3 times. If she changes her main stage name, all 3 copies must change.',
      ins: [{ t: 'chart_wide', m: ['d', '', 'd', '', 'd'], role: 'one wide table (a deliberately bad design)' }], lg: { d: 'Ayra Starr copied again' },
      note: 'Copies of the same fact are called <b>redundancy</b>. The next picture asks one question of every column.' },
    { h: 'Ask every column: what does it describe?', fig: 'place',
      fp: [['chart_date', 'the chart day', 'chart_entries', 'ev'], ['position', 'that song on that day', 'chart_entries', 'ev'], ['title', 'the song', 'songs', 'en'], ['artist', 'the artist', 'artists (as name)', 'en'], ['genre', 'the song (one main label)', 'songs', 'en']],
      say: 'The picture takes each column of the wide table and asks one question: is it a fact about the <b>artist</b>, a fact about the <b>song</b>, or does it exist only because of <b>that day’s chart</b>? The answer, shown at the end of each line, is the table the column belongs in.' },
    { h: 'After: each fact lives in the table it describes',
      say: 'Split by the answers. The artist\u2019s name is stored <b>once</b> in <code>artists</code>. The title, duration and genre are stored once in <code>songs</code>, which points at the artist by ID. <code>chart_entries</code> keeps only what belongs to the chart day: date, position and which song.',
      ins: [{ t: 'chart_wide', m: ['d', '', 'd', '', 'd'], role: 'before: facts copied on every row (a deliberately bad design)' }],
      after: [{ t: 'artists', m: ['n', ''], role: 'artists: name stored once' }, { t: 'songs', role: 'songs: title, duration, genre once' }, { t: 'chart_entries', role: 'chart_entries: only chart-day facts + song_id' }],
      lg: { d: 'copied fact', n: 'stored once' } },
    { h: 'Facts that exist only because something happened', fig: 'events', fp: [['10-15', '📊 SLICK #1, Heaven Baby #2'], ['10-16', '📊 Heaven Baby #1, SLICK #2'], ['10-17', '📊 Heaven Baby #1 again']],
      say: 'A chart position is not a fact about the song itself. "Heaven Baby is #2" was true only on 15 October. It exists because that day\u2019s chart <b>happened</b>, so it is stored with that event: a new <code>chart_entries</code> row each day, holding the date, the position and the song_id.' },
    { h: 'What if position lived in songs?', fig: 'state', fp: { who: 'songs.position for Heaven Baby', thing: 'song', lost: 'lost', vals: [['10-15', '2'], ['10-16', '1'], ['10-17', '1']] },
      say: 'Here is what happens if you ignore that answer. Put <code>position</code> in <code>songs</code> and there is room for only <b>one</b> value per song. Every day an UPDATE overwrites yesterday’s position, and the chart history is gone. Losing history like this is the sign that a column is in the wrong table: it describes an event, not the thing.' },
    { h: 'Where does the ID go? On the many side',
      say: 'A song has one main artist, and an artist has many songs. If <code>artists</code> held the songs, one cell would need a <b>list</b> ("1, 11") that cannot be checked or joined. Instead each song row holds <b>one</b> <code>artist_id</code>: the foreign key sits on the many side.',
      ins: [{ t: 'artists_bad', m: ['x', ''], role: 'wrong: a list of IDs in one cell' }],
      after: [{ t: 'songs', m: ['n', '', 'n'], role: 'right: one main artist_id per song row' }],
      lg: { x: '✕ list in one cell: cannot be checked or joined', n: '＋ one ID per row on the many side' } },
    { h: 'More than one value for one thing? Then it is not one column',
      say: 'Ask of every fact: <b>can one thing have more than one?</b> Ayra Starr is described as Afrobeats <i>and</i> R&B. Try to store genre on <code>artists</code> and both ways break. A list in one cell cannot be filtered, counted or joined reliably. A second row copies her name and her <code>artist_id</code> is no longer unique. Each song, though, carries one main genre, so genre is a column on <code>songs</code>.',
      stack: true, ins: [{ t: 'artists_list', m: ['x', ''], role: 'wrong 1: a list in one cell' }, { t: 'artists_dup', m: ['d', 'd', ''], role: 'wrong 2: the artist copied once per genre' }],
      after: [{ t: 'songs', m: ['n', 'n', 'n'], role: 'right: one genre per song row' }],
      lg: { x: '✕ two values in one cell', d: '2× same artist, two rows: artist_id no longer unique', n: '＋ one value per cell' },
      note: 'The rule "every cell holds one value" is called <b>first normal form</b> (1NF). If a song could have several genres too, add <code>song_genres(song_id, genre)</code>: one row per pair, like <code>playlist_songs</code>.' },
    { h: 'The same test on any data', fig: 'multi',
      say: 'Run the question on every fact before you give it a column: <b>for one of these things, can there be more than one?</b> Each line below asks it of one fact. An artist has one main stage name and a patient has one date of birth, so each of those is a column. An artist can have several other names, a song several featured artists, a product several categories and a student several phone numbers, so each of those gets a table of its own, with one row per value pointing back by ID.' },
    { h: 'Other names: one main name, many aliases', fig: 'flow',
      say: 'Here is the test on artist names. Wizkid is also known as Starboy and Big Wiz. The top table, <code>artists_names</code>, squeezes all three into one cell, which cannot be searched or joined reliably. Below it, <code>artists</code> keeps exactly one <b>main</b> stage name per artist in <code>name</code>, and <code>artist_aliases</code> holds every other name as its own row, pointing back by <code>artist_id</code>. A search for "Starboy" can now find artist 3.',
      stack: true, ins: [{ tab: ILT('artists_names', ['artist_id', 'names'], [[3, 'Wizkid, Starboy, Big Wiz']]), m: ['x'], role: 'wrong: a list of names in one cell' }],
      after: [{ tab: ILT('artists', ['artist_id', 'name'], [[3, 'Wizkid']]), m: ['n'], role: 'artists: one main stage name per artist' }, { tab: ILT('artist_aliases', ['artist_id', 'alias'], [[3, 'Starboy'], [3, 'Big Wiz']]), m: ['n', 'n'], role: 'artist_aliases: one row per other name' }],
      lg: { x: '✕ several values in one cell', n: '＋ one value per cell' } },
    { h: 'Event tables carry the IDs of everything involved', fig: 'erd',
      fp: { boxes: [{ n: 'chart_entries', sub: 'events', x: 6, y: 6, cols: [['chart_date', 'PK'], ['position'], ['song_id', 'PK FK']] }, { n: 'songs', x: 214, y: 60, cols: [['song_id', 'PK'], ['title'], ['artist_id', 'FK']] },
          { n: 'streams', sub: 'events', x: 6, y: 96, cols: [['stream_id', 'PK'], ['song_id', 'FK'], ['listener_id', 'FK'], ['streamed_at']] }, { n: 'listeners', x: 214, y: 150, cols: [['listener_id', 'PK'], ['name']] }],
        links: [{ f: ['chart_entries', 'song_id'], t: ['songs', 'song_id'] }, { f: ['streams', 'song_id'], t: ['songs', 'song_id'] }, { f: ['streams', 'listener_id'], t: ['listeners', 'listener_id'] }], label: 'events hold the IDs of what was involved',
        cap: 'Every event row holds the IDs of what took part: a chart entry holds <b>which song</b> (and the day); a stream holds <b>who</b> (listener_id) and <b>what</b> (song_id). The arrows always start at the event or the many side.' },
      say: 'Rule of thumb: <b>entities</b> hold facts about themselves. <b>Events</b> hold a time plus the IDs of everything involved. That is why <code>song_id</code> is in <code>chart_entries</code> and <code>streams</code>, but no stream ID is in <code>songs</code>.' },
    { h: 'Blueprints: the entity tables', fig: 'bp', fp: ['artists', 'songs', 'listeners', 'playlists'],
      say: 'These cards show every practice table, with each column’s data type and the reason the column is there. The entity tables come first: each one describes one kind of thing and has its own ID as its primary key.' },
    { h: 'Blueprints: the event and linking tables', fig: 'bp', fp: ['chart_entries', 'streams', 'playlist_songs'],
      say: 'These cards show the event and linking tables. An event table holds one row per happening, with the IDs of everything involved, and a linking table holds one row per pair of IDs.' },
    { h: 'Three questions that work on any data', fig: 'ask',
      fp: { ex: [['email', 'the customer', 'customers'], ['price', 'the product', 'products'], ['ordered_at', 'the order (an event)', 'orders'], ['quantity', 'one product on one order', 'order_items'], ['customer_id', 'one customer, many orders', 'orders (many side)']], erd: SHOP_ERD },
      say: 'Music was only the example. The same three questions place the columns of a shop, a hospital, a school or a bank. The picture applies them to a shop: each line names a column, what it describes, and the table it goes in. The questions after this picture use other kinds of data, to check that you can do it on tables you have never seen.' }
  ],
  qs: [
    { k: 'cls', q: 'Music: which table does each column belong in?', cats: ['artists', 'songs', 'chart_entries'],
      items: [['genre (one main genre per song)', 1, 'Each song carries one main genre. An artist can have several genres, so it cannot be one column on artists.'], ['duration_sec', 1, 'Describes the song itself.'], ['position on 17 Oct', 2, 'Exists only because of that day\u2019s chart (an event).'], ['streams that day', 2, 'A count for one song on one day: event table.'], ['title', 1, 'Describes the song.'], ['name of the artist', 0, 'Describes the artist; songs point at it by ID.']],
      why: 'Ask what each fact describes. A fact about the artist goes in artists, a fact about the song goes in songs, and a fact about that song on that chart day goes in chart_entries.' },
    { k: 'mc', ref: false, q: 'Which column can be the primary key of <code>listeners</code> (listener_id, name, email)? Two listeners have no email yet.', o: ['listener_id: unique on every row and never NULL', 'email: the emails that exist are unique', 'name: everyone has a name', 'email, because SQLite would accept the NULLs'],
      w: [null, 'A key must identify every row. Two rows with no email could not be told apart by email, and standard SQL forbids NULL in a primary key.', 'Names repeat: two listeners can both be called Ada.', 'SQLite\u2019s old exception only means it might not stop you. The key would still fail to identify those rows, and Postgres or DuckDB would reject it.'],
      why: 'A primary key needs two things on every row: a value (never NULL) and a different value from every other row (unique). Only listener_id has both.' },
    { k: 'mc', ref: false, q: '🏥 Hospital: <code>patients</code> has patient_id, national_id (new-born babies do not have one yet) and name. What is the primary key?', o: ['patient_id', 'national_id', 'name', '(national_id, name) together'],
      w: [null, 'Some patients have no national_id yet, so it would be NULL for them, and a primary key may never be NULL.', 'Two patients can share a name.', 'Combining columns does not help when one of them is missing: every column of a primary key must be filled.'],
      why: 'patient_id is given to every patient when the row is created, it is unique, and it is never missing.' },
    { k: 'mc', ref: false, q: 'Wizkid is also known as Starboy and Big Wiz. How do you store the other names?', o: ['a table artist_aliases(artist_id, alias), one row per other name', 'a column aliases on artists holding "Starboy, Big Wiz"', 'you do not: an artist has exactly one stage name', 'a new artists row (with a new artist_id) for each name'],
      w: [null, 'Several values in one cell cannot be searched, counted or joined reliably.', 'This was the simplified version. An artist has one main stage name, but can be known by several others.', 'That would make one person look like three artists, each with their own songs and streams.'],
      why: 'Ask "can one artist have more than one?". For other names the answer is yes, so they get their own table, while artists.name keeps the one main stage name.' },
    { k: 'mc', ref: false, q: '🏙️ Cities: Lagos is also called Èkó, and other cities have several names too. How do you store the extra names?', o: ['city_names(city_id, name): one row per extra name', 'a column names on cities holding "Lagos, Èkó"', 'a second cities row for Èkó with its own city_id', 'nowhere: a city has one name'],
      w: [null, 'A list in one cell cannot be searched or joined reliably.', 'Two city_ids would make one city look like two, and orders or addresses would be split between them.', 'Many places have more than one name, so "one name" is only true for some cities.'],
      why: 'Same test, other data: one city can have several names, so the names get their own table and point back by city_id.' },
    { k: 'tap', q: 'Tap every row of the wide table where Ayra Starr\u2019s name is a <b>copy</b> of the same fact.', t: 'chart_wide', ans: [0, 2, 4],
      why: 'Rows 1, 3 and 5 all repeat "Ayra Starr". That is redundancy: one fact, three copies. In artists it is stored once, and songs point at it by artist_id.' },
    { k: 'mc', ref: false, q: '🛒 Shop: <code>quantity</code> (how many of a product someone bought) belongs in which table?', o: ['order_items: it describes one product on one order', 'products', 'customers', 'orders'],
      w: [null, 'products holds facts about the product itself (name, price). The same product is bought in different quantities on different orders, so quantity is not a fact about the product.', 'A customer buys different amounts on different orders; quantity is not a fact about the person.', 'One order can contain several products, each with its own quantity, so one column on orders cannot hold them all.'],
      why: 'quantity exists only because a particular product was put on a particular order. The table whose row is "one product on one order" is order_items.' },
    { k: 'mc', ref: false, q: '🛒 Shop: one customer places many orders; each order is placed by one customer. Where does <code>customer_id</code> go?', o: ['orders: each order row holds the one customer who placed it (the many side)', 'customers: a list of order IDs per customer', 'products', 'both customers and products'],
      w: [null, 'A list of IDs in one cell cannot be checked or joined. The many side (orders) holds the single ID instead.', 'A product is bought by many customers; customer_id is not a fact about the product.', 'customers already has customer_id as its primary key. The link is a foreign key on orders, not a copy in products.'],
      why: 'The foreign key goes on the many side. Many orders belong to one customer, so each order row holds one customer_id: orders.customer_id.' },
    { k: 'cls', ref: false, q: '🛒 Shop: which table does each column belong in?', cats: ['customers', 'products', 'orders', 'order_items'],
      items: [['email', 0, 'Describes the customer.'], ['list price', 1, 'The product\u2019s current price: a fact about the product.'], ['ordered_at', 2, 'When the order happened: a fact about the order event.'], ['quantity', 3, 'One product on one order.'], ['price_paid (the price at the time of that order)', 3, 'Exists only because of that order line; it must not change when the list price changes later.'], ['date of birth', 0, 'Describes the customer, and a person has only one.']],
      why: 'Facts about the person go in customers, and facts about the product go in products. When the order was placed and who placed it go in orders, and facts about one product on one order go in order_items. Note list price (products) vs price paid (order_items): one describes the product today, the other describes a past event.' },
    { k: 'mc', ref: false, q: '🛒 Shop: a cart can hold many products and a product can sit in many carts. Where do "this product, 2 of them, in this cart" go?', o: ['cart_items(cart_id, product_id, quantity): a linking table, one row per product in a cart', 'a product_ids column in carts, like "4, 9, 12"', 'a cart_id column in products', 'a quantity column in customers'],
      w: [null, 'A list in one cell breaks keys and joins, and has nowhere to put the quantity of each product.', 'A product sits in many carts; one cart_id column could hold only one cart.', 'Quantity belongs to one product in one cart, not to the person.'],
      why: 'Many-to-many needs a linking table with one row per pair. The pair\u2019s own facts (quantity) live on that row.' },
    { k: 'cls', ref: false, q: '🏥 Hospital: entity, state, event or relationship?', cats: ['Entity', 'State', 'Event', 'Relationship'],
      items: [['a patient', 0, 'Exists on its own; gets a patients table and patient_id.'], ['a doctor', 0, 'Exists on its own; gets a doctors table and doctor_id.'], ['Dr Bello sees Ada at 10:30 on Monday', 2, 'Happened at a moment: a new row in appointments.'], ['the ward Ada is in right now', 1, 'A current fact that changes: overwritten when she moves.'], ['each appointment is with one doctor', 3, 'How two things connect: appointments.doctor_id → doctors.'], ['a blood test taken at 08:00', 2, 'Happened at a moment: one row per test.']],
      why: 'Things that exist on their own are entities; current changeable facts are state; things that happen at a time are events; "is with / belongs to" connects them (a relationship).' },
    { k: 'mc', ref: false, q: '🏥 Hospital: where does the appointment\u2019s date and time go?', o: ['appointments: the time exists only because the appointment happened', 'doctors', 'patients', 'a column in both doctors and patients'],
      w: [null, 'A doctor has hundreds of appointments; one column on doctors could hold only one time, and each new one would overwrite the last.', 'Same problem: a patient has many appointments over the years.', 'Copying the time onto two tables is redundancy, and each still holds only one value.'],
      why: 'A fact that exists because of an event goes in the event table, one row per appointment.' },
    { k: 'mc', ref: false, q: '🏥 Hospital: which table holds <code>patient_id</code> <b>and</b> <code>doctor_id</code>?', o: ['appointments: the event holds the IDs of everyone involved', 'patients holds doctor_id', 'doctors holds patient_id', 'neither: match them by name'],
      w: [null, 'A patient sees many doctors over time; patients.doctor_id could hold only one.', 'A doctor sees many patients; doctors.patient_id could hold only one.', 'Names repeat and get misspelt. Tables connect through IDs.'],
      why: 'Like a stream (listener + song), an appointment row carries patient_id and doctor_id, plus the time.' },
    { k: 'mc', ref: false, q: '🎓 School: a student takes many courses and a course has many students. Where does a student\u2019s <b>grade</b> for a course go?', o: ['enrolments(student_id, course_id, grade): it describes one student in one course', 'students', 'courses', 'a grades column in students listing every grade'],
      w: [null, 'A student has a different grade in each course, so one column on students cannot hold it.', 'A course gives different grades to different students.', 'A list in one cell cannot be checked, sorted or joined, and you cannot tell which grade is for which course.'],
      why: 'The grade belongs to the pair (this student, this course), so it lives on the linking row.' },
    { k: 'mc', ref: false, q: '🎓 School: in <code>enrolments(student_id, course_id, grade)</code>, what does <b>one row</b> stand for?', o: ['one student in one course', 'one student', 'one course', 'all the students in a course'],
      w: [null, 'A student with 5 courses has 5 rows, so a row is not one student.', 'A course with 30 students has 30 rows.', 'That would be many rows together, not one row.'],
      why: 'The grain of a linking table is one pair. Say the grain before you add a column to it.' },
    { k: 'mc', ref: false, q: '🏦 Bank: what is wrong with this table?', show: BAD('accounts', ['account_id', 'owner', 'balance', 'txn1', 'txn2', 'txn3'], [[501, 'Ada', 7000, 5000, -2000, 4000], [502, 'Tunde', 300, 300, null, null]]),
      o: ['transactions are events: each needs its own row in a transactions table (account_id, amount, time)', 'nothing: it is fine', 'balance should be removed', 'owner should be the primary key'],
      w: [null, 'A 4th transaction needs a new column, most cells are NULL, and you cannot SUM or sort them as rows.', 'Balance is legitimate state: the current value, updated after each transaction.', 'Names repeat (two people called Ada). account_id is the right key.'],
      why: 'Repeated columns (txn1, txn2, txn3) are events squeezed into one row. Each deposit or withdrawal is a new row in transactions, with account_id pointing at accounts.' },
    { k: 'mc', ref: false, q: '🏦 Bank: an account\u2019s <code>balance</code> is…', o: ['state: a current value that changes after each transaction', 'an event', 'an entity', 'a relationship'],
      w: [null, 'An event happens at a moment and is recorded once as a new row. The balance changes all the time; each transaction is the event.', 'The account is the entity. The balance is a fact about it.', 'It does not connect two things; it describes one account.'],
      why: 'Transactions (events) are kept forever as rows; the balance (state) is the current result of them, stored on accounts or computed with SUM(amount).' },
    { k: 'mc', ref: false, q: '🎓 School: spot the problem.', show: BAD('students', ['student_id', 'name', 'courses'], [[1, 'Zainab', 'Maths, Physics'], [2, 'Chidi', 'Maths']]),
      o: ['courses holds a list in one cell: use an enrolments table with one row per student and course', 'nothing: it is fine', 'name should be split into two tables', 'student_id should be TEXT'],
      w: [null, 'You cannot count students per course, join to courses, or add a grade to one course without rewriting the text.', 'name describes the student; it is in the right place.', 'The data type of the key is not the problem. The list in one cell is.'],
      why: 'A cell holds one value. Many-to-many (students ↔ courses) needs a linking table.' },
    { k: 'mc', ref: false, q: '🏥 Hospital: spot the problem.', show: BAD('appointments', ['appt_id', 'patient_name', 'patient_phone', 'doctor_name', 'starts_at'], [[1, 'Ada', '0803…', 'Dr Bello', 'Mon 10:30'], [2, 'Ada', '0803…', 'Dr Okafor', 'Tue 09:00'], [3, 'Ada', '0813…', 'Dr Bello', 'Fri 14:00']]),
      o: ['patient and doctor details are copied on every appointment: store patient_id and doctor_id, and keep the details in patients and doctors', 'nothing: it is fine', 'starts_at should move to patients', 'every appointment needs its own table'],
      w: [null, 'Ada\u2019s phone is already different on row 3: a copy was updated and the others were not (redundancy).', 'A patient has many appointments; one column on patients cannot hold every time.', 'Appointments are rows in one table, not one table each.'],
      why: 'Events hold the IDs of who was involved, not copies of their details. Facts about Ada belong once in patients.' },
    { k: 'mc', ref: false, q: '🛒 Shop: a product can be in several categories (a kettle is in Kitchen <b>and</b> Electricals). Where do categories go?', o: ['a product_categories table (product_id, category): one row per product and category', 'a category column in products holding "Kitchen, Electricals"', 'a second kettle row in products, one per category', 'a category column in products holding just the first one'],
      w: [null, 'Two values in one cell: you cannot filter "all Kitchen products" or count products per category reliably, and typos hide inside the text.', 'The kettle would have two rows: its product_id is no longer unique, and its price is copied (redundancy).', 'The other categories are lost: the table no longer tells the truth.'],
      why: 'One product can have more than one category, so the categories get their own rows instead of one column. Like playlist_songs, the table holds one row per (product, category) pair.' },
    { k: 'mc', ref: false, q: '🎓 School: a student can have several phone numbers (mum, dad). Which design is right?', show: BAD('students', ['student_id', 'name', 'phone1', 'phone2'], [[1, 'Zainab', '0803…', '0805…'], [2, 'Chidi', '0806…', null]]),
      o: ['student_phones(student_id, phone, who): one row per number', 'keep phone1, phone2 as shown', 'put both numbers in one phone cell', 'repeat the student row once per number'],
      w: [null, 'A third number needs a new column, most cells end up NULL, and "find the student with this number" must check every phone column.', 'Two values in one cell cannot be searched or validated reliably.', 'Zainab would have two rows: student_id is no longer unique and her name is copied.'],
      why: 'Can a student have more than one phone number? Yes, so it cannot be a single column on students. A student_phones table holds one row per number, with student_id pointing back.' },
    { k: 'run', q: 'Each song\u2019s genre lives once, in the table it describes. Fill in ____ to read SLICK\u2019s genre.', code: "SELECT genre\nFROM ____\nWHERE title = 'SLICK';", sol: "SELECT genre FROM songs WHERE title = 'SLICK';",
      why: 'Each song has one main genre, so genre is a column on songs. Read it from there: one row, one cell.' }
  ]
};
ILLUS.sql5.scenes.unshift({ h: 'Joins follow the arrow', fig: 'erd',
  fp: { boxes: [erdAt(ERD_ART, 6, 6), erdAt(ERD_SNG, 214, 6)], links: [ERD_L_SA], label: 'songs.artist_id points to artists.artist_id' },
  say: 'You met this arrow in <i>Entities, events & relationships</i>: <code>songs.artist_id</code> (foreign key) points at <code>artists.artist_id</code> (primary key). A <b>JOIN follows that arrow</b> for every row at once, bringing each song back together with its artist. The ON clause is the arrow written in SQL:',
  sql: 'SELECT s.title, a.name\nFROM songs s\nJOIN artists a\n  ON s.artist_id = a.artist_id;  -- the arrow', norun: true,
  note: 'No arrow, no join: two tables with no shared ID (like listeners and artists) are joined by going through tables that do share IDs.' });

/* ---------- v7 custom figures: entities, state, events, relationships, ERD ---------- */
// ERD: boxes = tables (header + columns tagged PK/FK), lines = FK → PK (crow's foot "many" at the FK end, bar + arrow "1" at the PK end)
function erdSVG(fp) {
  const W = 150, HH = 20, RH = 16, bx = {};
  fp.boxes.forEach(b => { bx[b.n] = Object.assign({ h: HH + b.cols.length * RH }, b); });
  const ry = (b, c) => b.y + HH + b.cols.findIndex(x => x[0] === c) * RH + RH / 2;
  let maxX = 0, maxY = 0; Object.values(bx).forEach(b => { maxX = Math.max(maxX, b.x + W); maxY = Math.max(maxY, b.y + b.h); });
  let lines = '';
  let padR = 18;
  (fp.links || []).forEach(k => {
    const f = bx[k.f[0]], t = bx[k.t[0]]; const y1 = ry(f, k.f[1]), y2 = ry(t, k.t[1]); const cls = 'el' + (k.hl ? ' hl' : '') + (k.dim ? ' dim' : '');
    let d, fx, tx, fdir, tdir;
    if (f.x === t.x) { padR = 48; fx = f.x + W; tx = t.x + W; const xr = fx + 14; d = 'M' + fx + ',' + y1 + ' H' + xr + ' V' + y2 + ' H' + tx; fdir = 1; tdir = 1; }
    else if (f.x > t.x) { fx = f.x; tx = t.x + W; const mid = (fx + tx) / 2; d = 'M' + fx + ',' + y1 + ' H' + mid + ' V' + y2 + ' H' + tx; fdir = -1; tdir = 1; }
    else { fx = f.x + W; tx = t.x; const mid = (fx + tx) / 2; d = 'M' + fx + ',' + y1 + ' H' + mid + ' V' + y2 + ' H' + tx; fdir = 1; tdir = -1; }
    // crow's foot at the FK (many) end, arrow + bar at the PK (one) end
    const cf = 'M' + (fx + fdir * 10) + ',' + y1 + ' L' + fx + ',' + (y1 - 5) + ' M' + (fx + fdir * 10) + ',' + y1 + ' L' + fx + ',' + (y1 + 5);
    const ar = 'M' + (tx + tdir * 7) + ',' + (y2 - 4) + ' L' + tx + ',' + y2 + ' L' + (tx + tdir * 7) + ',' + (y2 + 4) + ' M' + (tx + tdir * 11) + ',' + (y2 - 5) + ' V' + (y2 + 5);
    const lab = (x, y, s, a) => '<text x="' + x + '" y="' + y + '" class="elab" text-anchor="' + a + '">' + s + '</text>';
    lines += '<path d="' + d + '" class="' + cls + '"/><path d="' + cf + ' ' + ar + '" class="' + cls + ' end"/>' +
      (f.x === t.x ? lab(fx + 17, y1 + 3, 'many', 'start') : lab(fx + fdir * 3, y1 - 7, 'many', fdir > 0 ? 'start' : 'end')) + lab(tx + tdir * 3, y2 - 7, '1', tdir > 0 ? 'start' : 'end');
  });
  const boxes = Object.values(bx).map(b => '<g class="eb' + (b.hl ? ' hl' : '') + (b.dim ? ' dim' : '') + '"><rect x="' + b.x + '" y="' + b.y + '" width="' + W + '" height="' + b.h + '" rx="5" class="ebr"/><rect x="' + b.x + '" y="' + b.y + '" width="' + W + '" height="' + HH + '" rx="5" class="ebh"/>' +
    '<text x="' + (b.x + 8) + '" y="' + (b.y + 14) + '" class="ebn">' + _h(b.n) + (b.sub ? ' <tspan class="ebs">' + _h(b.sub) + '</tspan>' : '') + '</text>' +
    b.cols.map((c, i) => { const y = b.y + HH + i * RH + 12; return '<text x="' + (b.x + 8) + '" y="' + y + '" class="ebc' + (c[1] ? ' k' : '') + '">' + _h(c[0]) + '</text>' + (c[1] ? '<text x="' + (b.x + W - 8) + '" y="' + y + '" class="ebk ' + c[1].toLowerCase() + '" text-anchor="end">' + c[1] + (c[2] ? ' → ' + _h(c[2]) : '') + '</text>' : ''); }).join('') + '</g>').join('');
  return '<svg class="erd" viewBox="0 0 ' + (maxX + padR) + ' ' + (maxY + 6) + '" role="img" aria-label="' + _h(fp.label || 'entity-relationship diagram') + '">' + boxes + lines + '</svg>' +
    (fp.cap ? '<div class="figcap">' + fp.cap + '</div>' : '');
}
// two columns of dots joined by lines: who is linked to whom (solid = stored fact, dashed = created by an event)
function bipSVG(fp) {
  const n = Math.max(fp.l.length, fp.r.length), RH = 24, H = 26 + n * RH;
  const ly = i => 34 + i * RH, LX = 96, RX = 204;
  const e = (fp.e || []).map(x => '<line x1="' + LX + '" y1="' + ly(x[0]) + '" x2="' + RX + '" y2="' + ly(x[1]) + '" class="bl' + (x[2] === 'd' ? ' dash' : '') + '"/>').join('');
  const lonely = i => !(fp.e || []).some(x => x[0] === i);
  return '<svg class="bip" viewBox="0 0 300 ' + H + '" role="img" aria-label="' + _h(fp.lt + ' to ' + fp.rt) + '"><text x="' + LX + '" y="14" class="bh" text-anchor="end">' + _h(fp.lt) + '</text><text x="' + RX + '" y="14" class="bh">' + _h(fp.rt) + '</text>' + e +
    fp.l.map((s, i) => '<circle cx="' + LX + '" cy="' + ly(i) + '" r="4" class="bd"/><text x="' + (LX - 8) + '" y="' + (ly(i) + 4) + '" class="bt' + (lonely(i) ? ' lone' : '') + '" text-anchor="end">' + _h(s) + '</text>').join('') +
    fp.r.map((s, i) => '<circle cx="' + RX + '" cy="' + ly(i) + '" r="4" class="bd"/><text x="' + (RX + 8) + '" y="' + (ly(i) + 4) + '" class="bt">' + _h(s) + '</text>').join('') + '</svg>' +
    (fp.cap ? '<div class="figcap">' + fp.cap + '</div>' : '');
}
const ILL_FIGS = {
  erd: sc => erdSVG(sc.fp),
  bip: sc => bipSVG(sc.fp),
  // entities: things that exist on their own, each with a table and an ID
  ent: () => '<div class="entf">' + [['🎤', 'artist', 'artists', 'artist_id'], ['🎵', 'song', 'songs', 'song_id'], ['🎧', 'listener', 'listeners', 'listener_id']].map(x =>
      '<div class="entc"><div class="ei">' + x[0] + '</div><b>' + x[1] + '</b><div class="muted small">table <code>' + x[2] + '</code></div><div class="small">ID <code>' + x[3] + '</code> <span class="pk">PK</span></div></div>').join('') + '</div>' +
    '<div class="figcap">Exist on their own, even if nothing ever happens. <b>Not</b> entities: <i>a play at 21:14</i> (an event) or <i>today\u2019s chart position</i> (an event fact: it belongs to that day\u2019s chart).</div>',
  // state: one value per entity, overwritten over time
  state: sc => { const f = sc.fp; return '<div class="stf"><div class="stw">' + _h(f.who) + '</div><div class="stl">' + f.vals.map((v, i) => {
      const last = i === f.vals.length - 1; return '<div class="sts' + (last ? ' now' : ' old') + '"><div class="stt">' + _h(v[0]) + '</div><div class="stv">' + (last ? '' : '<s>') + _h(v[1]) + (last ? '' : '</s>') + '</div><div class="muted small">' + (last ? 'current value' : (f.lost || 'overwritten: lost')) + '</div></div>' + (last ? '' : '<div class="farr">→<div class="small muted">UPDATE</div></div>'); }).join('') + '</div></div>' +
    '<div class="figcap">Still <b>one</b> row for the ' + (f.thing || 'artist') + '. The column holds only the latest value.</div>'; },
  // events: rows appearing along a time line, not edited in normal use
  events: sc => '<div class="evf">' + sc.fp.map((e, i) => '<div class="evr"><div class="evt">' + _h(e[0]) + '</div><div class="evd"></div><div class="evx">' + e[1] + '</div><div class="evn">+ row ' + (i + 1) + '</div></div>').join('') + '</div>' +
    '<div class="figcap">Each happening adds a <b>new row</b> with its time and the IDs involved. Old rows are not edited in normal use; a mistake is fixed with a correction.</div>',
  // the three kinds of relationship
  kinds: () => [
    ['One-to-many', { lt: 'artists', rt: 'songs', l: ['Burna Boy', 'Tems'], r: ['Last Last', 'City Boys', 'Free Mind'], e: [[0, 0], [0, 1], [1, 2]] }, 'Each song has one main artist, and an artist has many songs. The FK sits on the <b>many</b> side: <code>songs.artist_id</code>. (Featured artists are many-to-many, so they need a linking table such as <code>song_artists</code>.)'],
    ['One-to-one', { lt: 'artists', rt: 'profiles', l: ['Burna Boy', 'Tems'], r: ['profile 1', 'profile 2'], e: [[0, 0], [1, 1]] }, 'Each artist has one profile. <code>profiles.artist_id</code> is unique (often the profile\u2019s own PK).'],
    ['Many-to-many', { lt: 'listeners', rt: 'songs', l: ['Ada', 'Tunde'], r: ['Last Last', 'Free Mind'], e: [[0, 0], [0, 1], [1, 0]] }, 'Many on <b>both</b> sides. No single FK column can hold it, so it needs a <b>linking table</b> with one row per pair. For listeners and songs that table is <code>streams</code>; for playlists and songs it is <code>playlist_songs</code>.']
  ].map(k => '<div class="kind"><div class="kh">' + k[0] + '</div>' + bipSVG(k[1]) + '<div class="figcap">' + k[2] + '</div></div>').join('')
};

/* ---------- v8 custom figures: table anatomy, schema, column placement, blueprints, transfer checklist ---------- */
const PIN = n => '<span class="pin">' + n + '</span>';
const ANAT_KEY = [
  ['Table name', '<code>songs</code>: what kind of thing every row is. One table per kind of thing.'],
  ['Column', 'one named field, read <b>downwards</b> (<code>title</code>). Every row has a value for it.'],
  ['Row (record)', 'one thing, read <b>across</b>: here, one song (SLICK).'],
  ['Cell', 'the single value where <b>one row</b> meets <b>one column</b>: 163 is the duration of Goodbye.'],
  ['Data type', 'what kind of value the column may hold (INTEGER, TEXT). Every cell in the column must fit it.'],
  ['Primary key (PK)', '<code>song_id</code>: different on every row, never NULL. It is how other tables point at a song.'],
  ['Foreign key (FK)', '<code>artist_id</code>: holds another table\u2019s primary key (<code>artists.artist_id</code>). It may repeat: artist 1 has two songs.']
];
function anatFig() {
  const t = TBL_SONGS, types = ['INTEGER', 'TEXT', 'INTEGER', 'INTEGER', 'TEXT'];
  const th = (c, i) => '<th class="' + (i === 0 ? 'an-pk' : i === 2 ? 'an-fk' : '') + '">' + (i === 0 ? PIN(6) : i === 1 ? PIN(2) : i === 2 ? PIN(7) : '') + _h(c).replace(/_/g, '_<wbr>') + '</th>';
  const td = (v, i, r) => '<td class="' + (i === 0 ? 'an-pk' : i === 2 ? 'an-fk' : '') + (r === 2 && i === 3 ? ' an-cell' : '') + '">' + (r === 2 && i === 3 ? PIN(4) : '') + _h(v) + '</td>';
  return '<div class="anat"><div class="an-name">' + PIN(1) + ' table <code>' + t.n + '</code></div><div class="ill-scroll"><table class="mini anat-t"><tr><th class="an-g"></th>' + t.c.map(th).join('') + '</tr>' +
    '<tr class="an-type"><td class="an-g">' + PIN(5) + '</td>' + types.map((x, i) => '<td class="' + (i === 0 ? 'an-pk' : i === 2 ? 'an-fk' : '') + '">' + x + '</td>').join('') + '</tr>' +
    t.r.map((r, k) => '<tr' + (k === 1 ? ' class="an-row"' : '') + '><td class="an-g">' + (k === 1 ? PIN(3) : '') + '</td>' + r.map((v, i) => td(v, i, k)).join('') + '</tr>').join('') + '</table></div>' +
    '<ol class="an-key">' + ANAT_KEY.map((k, i) => '<li>' + PIN(i + 1) + '<span><b>' + k[0] + '</b>: ' + k[1] + '</span></li>').join('') + '</ol>' +
    '<div class="figcap">Grey row = the data type of each column (part of the blueprint, not a stored row). Amber column = primary key; green column = foreign key.</div></div>';
}
function ddlFig() {
  const L = [['CREATE TABLE songs (', ['table name']], ['  song_id      INTEGER PRIMARY KEY,', ['column', 'data type', 'primary key']], ['  title        TEXT NOT NULL,', ['column', 'data type', 'rule: must have a value']],
    ['  artist_id    INTEGER REFERENCES artists(artist_id),', ['column', 'data type', 'foreign key → artists']], ['  duration_sec INTEGER,', ['column', 'data type']], ['  genre        TEXT', ['column', 'data type', 'may be NULL']], [');', []]];
  return '<div class="ddl">' + L.map(x => '<div class="ddl-l"><code>' + _h(x[0]) + '</code>' + (x[1].length ? '<div class="ddl-t">' + x[1].map(t => '<span class="tg' + (/primary/.test(t) ? ' pk' : /foreign/.test(t) ? ' fk' : '') + '">' + t + '</span>').join('') + '</div>' : '') + '</div>').join('') + '</div>' +
    '<div class="figcap">Same table, two views: the picture before showed the <b>data</b>; this is the <b>schema</b>. Columns and types are decided first; rows come later.</div>';
}
function placeFig(sc) {
  return '<div class="plc">' + sc.fp.map(x => '<div class="plc-r ' + x[3] + '"><code>' + _h(x[0]) + '</code><span class="farr">→</span><span>describes <b>' + _h(x[1]) + '</b></span><span class="farr">→</span><code>' + _h(x[2]) + '</code></div>').join('') + '</div>' +
    '<div class="figcap"><span class="plc-k en">entity fact</span> describes a thing that exists on its own. <span class="plc-k ev">event fact</span> exists only because something happened (that day\u2019s chart).</div>';
}
function bpFig(sc) {
  return '<div class="bps">' + sc.fp.map(n => { const b = BLUEPRINTS[n];
    return '<div class="bp ' + b[0] + '"><div class="bp-h"><code>' + n + '</code> <span class="tg">' + b[0] + '</span></div><div class="small muted">one row = <b>' + b[1] + '</b></div>' +
      '<div class="bp-c">' + b[2].map(c => '<div class="bp-r"><div><code>' + c[0] + '</code> <span class="ty">' + c[1] + '</span>' + (c[2] ? c[2].split(' ').map(k => ' <span class="tg ' + k.toLowerCase() + '">' + k + '</span>').join('') : '') + '</div><div class="small muted">' + c[3] + '</div></div>').join('') + '</div>' +
      '<div class="lab small">Sample row</div><div class="ill-scroll">' + MT(b[2].map(c => c[0]), [b[3]]) + '</div></div>'; }).join('') + '</div>';
}
function askFig(sc) {
  const Q = [['What does one row stand for?', 'Say the grain: one customer, one order, one product on one order.'], ['What does this fact describe?', 'A fact about a thing that exists on its own goes in that thing\u2019s table. A fact that exists only because something happened goes in the event table.'], ['One or many?', 'The ID goes on the <b>many</b> side. If both sides are many, add a linking table with one row per pair.'], ['More than one value for one thing?', 'Then it is not one column on that thing (a cell holds one value): give it its own table, one row per value.']];
  return '<ol class="ask">' + Q.map((q, i) => '<li>' + PIN(i + 1) + '<span><b>' + q[0] + '</b> ' + q[1] + '</span></li>').join('') + '</ol>' +
    '<div class="plc">' + sc.fp.ex.map(x => '<div class="plc-r"><code>' + _h(x[0]) + '</code><span class="farr">→</span><span>' + _h(x[1]) + '</span><span class="farr">→</span><code>' + _h(x[2]) + '</code></div>').join('') + '</div>' + erdSVG(sc.fp.erd);
}
// v8.1: the "more than one?" test on several kinds of data
const MULTI_EX = [['genre', 'an artist', 'yes (Afrobeats, R&B)', 'not on artists: one main genre per song → songs.genre'], ['main stage name', 'an artist', 'no', 'artists.name'], ['other names (aliases)', 'an artist', 'yes (Starboy, Big Wiz)', 'artist_aliases(artist_id, alias)'], ['featured artist', 'a song', 'yes (several)', 'song_artists(song_id, artist_id)'], ['category', 'a product', 'yes (Kitchen, Electricals)', 'product_categories(product_id, category)'], ['phone number', 'a student', 'yes (mum, dad)', 'student_phones(student_id, phone)'], ['date of birth', 'a patient', 'no', 'patients.date_of_birth']];
function multiFig() {
  return '<div class="plc">' + MULTI_EX.map(x => '<div class="plc-r ' + (x[2] === 'no' ? 'en' : 'ev') + '"><code>' + _h(x[0]) + '</code><span>of ' + _h(x[1]) + ':</span><span>more than one? <b>' + _h(x[2]) + '</b></span><span class="farr">→</span><code>' + _h(x[3]) + '</code></div>').join('') + '</div>' +
    '<div class="figcap"><span class="plc-k en">one value</span> a column on that thing\u2019s table. <span class="plc-k ev">can be several</span> its own rows: one row per value.</div>';
}
Object.assign(ILL_FIGS, { anat: anatFig, ddl: ddlFig, place: placeFig, bp: bpFig, ask: askFig, multi: multiFig });

/* ---------- v6 illustration rendering (before → query → after) ---------- */
const ILL_LG = { m: '✓ kept / matched', u: '◐ kept with no match: the other side is NULL', x: '✕ not in the result', d: '2× appears twice (a duplicate)', n: '＋ new or changed', g: '🎨 same colour = same group' };
const ILL_ICON = { m: '✓', u: '◐', x: '✕', d: '2×', n: '＋' };
function illCell(v) {
  if (v === null || v === undefined) return '<td class="null"><span>NULL</span></td>';
  const s = String(v); const vis = s.replace(/^ +| +$/g, m => '␣'.repeat(m.length));
  return '<td>' + _h(vis) + '</td>';
}
// one table; marks colour rows; tap = {sel:Set-like array, done, ans} turns rows into buttons
function illTable(t, m, o) {
  o = o || {}; m = m || []; const nc = o.nc || [];
  const hasMk = m.some(x => x && ILL_ICON[x]);
  return '<div class="ill-t">' + (o.role ? '<div class="ill-role">' + o.role + '</div>' : '') + (o.name !== false ? '<div class="ill-name"><code>' + _h(t.n) + '</code> · ' + t.r.length + ' row' + (t.r.length === 1 ? '' : 's') + '</div>' : '') +
    '<div class="ill-scroll"><table class="mini ill"><tr>' + (hasMk ? '<th class="mk"></th>' : '') + t.c.map((c, i) => '<th' + (o.tapc ? illThTap(o.tapc, i) : nc.includes(i) ? ' class="newc"' : '') + '>' + _h(c).replace(/_/g, '_<wbr>') + '</th>').join('') + '</tr>' +
    t.r.map((r, i) => {
      const mk = m[i] || ''; let cls = mk ? 'mk-' + mk : ''; let attr = '';
      if (o.tap) { const on = o.tap.sel.includes(i); cls += ' tapr' + (on ? ' on' : ''); if (o.tap.done) { const want = o.tap.ans.includes(i); cls += want === on ? (want ? ' good' : '') : ' wrong'; } else attr = ' data-act="vqTap" data-r="' + i + '" tabindex="0" role="button" aria-pressed="' + on + '"'; }
      const why = o.why && o.why[i] ? '<tr class="why mk-' + mk + '"><td colspan="' + (r.length + (hasMk ? 1 : 0)) + '">' + (ILL_ICON[mk] ? '<b>' + ILL_ICON[mk] + '</b> ' : '') + o.why[i] + '</td></tr>' : '';
      return '<tr class="' + cls + '"' + attr + '>' + (hasMk ? '<td class="mk">' + (ILL_ICON[mk] || '') + '</td>' : '') + r.map((v, j) => illCell(v).replace('<td', nc.includes(j) ? '<td data-new="1"' : '<td')).join('') + '</tr>' + why;
    }).join('') + '</table></div></div>';
}
function illThTap(tc, i) { const on = tc.sel.includes(i); let c = 'tapc' + (on ? ' on' : ''); if (tc.done) { const want = tc.ans.includes(i); c += want === on ? (want ? ' good' : '') : ' wrong'; return ' class="' + c + '"'; }
  return ' class="' + c + '" data-act="vqTapC" data-c="' + i + '" tabindex="0" role="button" aria-pressed="' + on + '"'; }
function vennSVG(kind, a, b, vl) {
  vennSVG.n = (vennSVG.n || 0) + 1; const id = 'vc' + vennSVG.n; const f = 'class="vf"';
  const L = 'cx="95" cy="66" r="56"', R = 'cx="165" cy="66" r="56"';
  let sh = '';
  if (kind === 'left' || kind === 'full') sh += '<circle ' + L + ' ' + f + '/>';
  if (kind === 'right' || kind === 'full') sh += '<circle ' + R + ' ' + f + '/>';
  if (kind === 'inner') sh += '<g clip-path="url(#' + id + ')"><circle ' + R + ' ' + f + '/></g>';
  // region labels: words on separate lines so long names fit inside their region
  const lab = (x, t) => { const w = String(t).split(' '); return '<text x="' + x + '" y="' + (70 - (w.length - 1) * 5) + '" class="vt" text-anchor="middle">' + w.map((p, i) => '<tspan x="' + x + '" dy="' + (i ? 11 : 0) + '">' + _h(p) + '</tspan>').join('') + '</text>'; };
  const labs = vl ? lab(66, vl[0]) + lab(130, vl[1]) + lab(194, vl[2]) : '';
  return '<svg class="venn" viewBox="0 0 260 150" role="img" aria-label="' + _h(kind) + ' join: ' + _h(a) + ' left, ' + _h(b) + ' right"><defs><clipPath id="' + id + '"><circle ' + L + '/></clipPath></defs>' + sh +
    '<circle ' + L + ' class="vo"/><circle ' + R + ' class="vo"/>' + labs +
    '<text x="70" y="140" class="vn" text-anchor="middle">⬅ ' + _h(a) + ' (LEFT)</text><text x="190" y="140" class="vn" text-anchor="middle">' + _h(b) + ' (RIGHT) ➡</text></svg>';
}
// which table is LEFT / RIGHT: only the written order decides
function lrFig(a, b) {
  return '<div class="lrf"><div class="lrr"><code>FROM ' + _h(a) + '</code><span class="farr">→</span><b>LEFT</b><span class="muted small">written first</span></div>' +
    '<div class="lrr"><code>JOIN ' + _h(b) + '</code><span class="farr">→</span><b>RIGHT</b><span class="muted small">written second</span></div>' +
    '<div class="lrr sw">⇄ <code>FROM ' + _h(b) + ' … JOIN ' + _h(a) + '</code> → now <b>' + _h(b) + '</b> is LEFT</div></div>';
}
// row chips: inputs → outputs, coloured like the rows (shows grouping, filtering, stacking)
function flowFig(ins, out) {
  const chip = m => '<i class="fc mk-' + (m || 'm') + '"></i>';
  const inN = ins.reduce((s, x) => s + x.rows, 0);
  return '<div class="flow" aria-hidden="true"><div class="fcol">' + ins.map(x => '<div class="fstack">' + Array.from({ length: x.rows }, (_, i) => chip(x.m && x.m[i])).join('') + '</div>').join('') + '</div><div class="farr">→</div><div class="fcol"><div class="fstack">' +
    (out && out.r ? out.r.map((_, i) => chip(out.m && out.m[i])).join('') : out && out.err ? '<b class="bad">✕ error</b>' : '') + '</div></div><div class="fcnt">' + inN + ' row' + (inN === 1 ? '' : 's') + ' in → ' + (out && out.r ? out.r.length + ' row' + (out.r.length === 1 ? '' : 's') + ' out' : 'refused') + '</div></div>';
}
function illTables(L, ts) { return (ts && L.tsets && L.tsets[ts]) || L.tables; }
function illTab(L, x, ts) { return x.tab || (L && illTables(L, x.ts || ts)[x.t]); }
// v10: a specific reason for every marked row: scene-level (x.why / out.why) or the ILL_WHY overlay by lesson|title
function illWhy(L, sc, part, i) { const x = part === 'out' ? sc.out : part[0] === 'a' ? sc.after[+part.slice(1)] : sc.ins[+part.slice(1)];
  if (x && x.why) return x.why; const o = L && typeof ILL_WHY !== 'undefined' && ILL_WHY[(L.id || '') + '|' + sc.h]; return o && o[part] || null; }
// the whole figure for a scene: BEFORE tables (written order) → query → diagram → AFTER table → legend
function illFigHTML(sc, L, run) {
  const ts = sc.ts; const ins = (sc.ins || []).map((x, i) => x.raw ? '<div class="ill-t"><div class="ill-role">' + (x.role || 'Input') + '</div><pre class="qy raw">' + _h(x.raw) + '</pre></div>' : illTable(illTab(L, x, ts), x.m, { role: x.role, why: illWhy(L, sc, 'i' + i) }));
  const used = new Set(); (sc.ins || []).forEach(x => (x.m || []).forEach(k => used.add(k))); ((sc.out && sc.out.m) || []).forEach(k => used.add(k)); (sc.after || []).forEach(x => (x.m || []).forEach(k => used.add(k)));
  const lg = Object.assign({}, ILL_LG, sc.lg || {}); const lgs = []; ['m', 'u', 'x', 'd', 'n'].forEach(k => { if (used.has(k)) lgs.push('<span class="lg mk-' + k + '">' + lg[k] + '</span>'); });
  if ([...used].some(k => /^g/.test(k))) lgs.push('<span class="lg">' + lg.g + '</span>');
  let fig = '';
  if (/^venn-/.test(sc.fig || '')) { const a = illTab(L, sc.ins[0], ts), b = illTab(L, sc.ins[1], ts); fig = vennSVG(sc.fig.slice(5), a.n, b.n, sc.vl); }
  else if (sc.fig === 'lr') fig = lrFig(illTab(L, sc.ins[0], ts).n, illTab(L, sc.ins[1], ts).n);
  else if (ILL_FIGS[sc.fig]) fig = ILL_FIGS[sc.fig](sc, L);
  else if (sc.fig === 'flow') fig = flowFig((sc.ins || []).map(x => ({ rows: x.raw ? 1 : illTab(L, x, ts).r.length, m: x.m })), sc.out);
  const outH = !sc.out ? '' : sc.out.err ? '<div class="ill-t"><div class="ill-role">After</div><div class="ill-err">✕ Error: ' + _h(sc.out.err) + '</div></div>'
    : illTable({ n: 'result', c: sc.out.c, r: sc.out.r }, sc.out.m, { role: sc.out.role || 'After: the result', nc: sc.out.nc, name: false, why: illWhy(L, sc, 'out') }) + '<div class="muted small">' + sc.out.r.length + ' row' + (sc.out.r.length === 1 ? '' : 's') + (sc.out.nc && sc.out.nc.length ? ' · <span class="newc-k">highlighted column</span> = added by the query' : '') + '</div>';
  const aft = sc.after ? '<div class="ill-ins' + (sc.after.length === 2 ? ' two' : '') + '">' + sc.after.map((x, i) => illTable(illTab(L, x, ts), x.m, { role: x.role, why: illWhy(L, sc, 'a' + i) })).join('') + '</div>' : '';
  let n = 0; const stp = t => '<div class="ill-step">' + (++n) + ' · ' + t + '</div>';
  const marked = (sc.ins || []).some(x => (x.m || []).some(k => ILL_ICON[k]));
  const qyH = sc.sql || sc.code ? stp(sc.sql ? 'Query' : 'Code') + QY(sc.sql || sc.code) : '';
  const qFirst = marked && qyH && !sc.qlast; // v10: the question/filter comes before the table that is marked against it
  return '<div class="ill">' + (sc.ask ? '<div class="ill-ask"><b>Question:</b> ' + sc.ask + '</div>' : '') + (qFirst ? qyH : '') +
    (ins.length ? stp(qFirst ? 'Before: each row marked against this query' : 'Before') + '<div class="ill-ins' + (ins.length === 2 && !sc.stack ? ' two' : '') + '">' + ins.join('') + '</div>' : '') +
    (qFirst ? '' : qyH) +
    (fig ? '<div class="ill-fig">' + fig + '</div>' : '') +
    (outH || aft ? stp('After') + outH + aft : '') +
    (lgs.length ? '<div class="ill-lg">' + lgs.join('') + '</div>' : '') +
    (run ? '<div class="ill-run"><div class="lab">▶ Run in the app (real SQLite on these tables)</div>' + run + '</div>' : '') + '</div>';
}

/* ---------- illustration state (additive: T.vis in deLearn.terms) ---------- */
function visState(lid) { if (!T.vis || typeof T.vis !== 'object') T.vis = {}; return T.vis[lid] || (T.vis[lid] = { seen: null, q: {} }); }
function visSeen(lid) { return !ILLUS[lid] || !!(T.vis && T.vis[lid] && T.vis[lid].seen); }
// illustration scenes + visual questions for one lesson, in teaching order
function illusSteps(lid, maxQ, onlyNew) {
  const L = ILLUS[lid]; if (!L) return [];
  let out;
  const nk = T.vis && T.vis[lid] && T.vis[lid].v10 ? 'v101' : 'v10'; // v10.1: learners who finished the v10 steps get only the v10.1 rewrites
  if (L.order) out = L.order.filter(([k, i]) => !onlyNew || (k === 's' ? L.scenes[i] : L.qs[i])[nk]).map(([k, i]) => k === 's' ? { type: 'illus', lesson: lid, sc: i } : { type: 'vq', lesson: lid, qi: i });
  else {
    const s = L.scenes.map((_, i) => ({ type: 'illus', lesson: lid, sc: i }));
    const q = L.qs.map((_, i) => ({ type: 'vq', lesson: lid, qi: i })).slice(0, maxQ == null ? 99 : maxQ);
    out = s.concat(q);
  }
  const sc = out.filter(x => x.type === 'illus'); if (sc.length) sc[sc.length - 1].last = true;
  out.forEach((x, i) => { x.pos = i + 1; x.of = out.length; if (onlyNew) x.isNew = true; });
  return out;
}
// v10: stable question IDs (legacy questions keep lid.k, k = their original position; new questions carry an id)
function vqId(lid, qi) { const q = ILLUS[lid].qs[qi]; return q.id || lid + '.' + qi; }
function vqRec(lid, qi) { const v = T.vis && T.vis[lid]; if (!v) return null; return (v.qid && v.qid[vqId(lid, qi)]) || (v.q && !ILLUS[lid].qs[qi].id && v.q[qi]) || null; }
function v10Pending(lid, v10only) { const L = ILLUS[lid]; if (!L || !L.order) return false; const v = (T.vis && T.vis[lid]) || {}; const has = k => L.order.some(([t, i]) => (t === 's' ? L.scenes[i] : L.qs[i])[k]);
  return has('v10') && !v.v10 || !v10only && has('v101') && !!v.v10 && !v.v101; } // v10only: the v10.1 rewrites never re-lock a rung
// existing learners: one lesson a day whose illustration they have not seen yet (theory read or placed),
// lessons with terms already in progress first, then curriculum order
function catchUpIllus() {
  const cands = []; orderedReadyModules().forEach(m => m.lessons.forEach(l => { if (ILLUS[l.id] && !visSeen(l.id) && S.theory[l.id]) cands.push(l); }));
  const busy = l => l.itemIds.some(id => T.terms[id] && T.terms[id].st !== 'done');
  const l = cands.find(busy) || cands[0];
  if (l) return { id: l.id, onlyNew: false };
  // v10: lessons already seen get only their new or rewritten steps, labelled "New in v10"
  for (const m of orderedReadyModules()) for (const x of m.lessons) if (visSeen(x.id) && ILLUS[x.id] && T.vis[x.id] && v10Pending(x.id)) return { id: x.id, onlyNew: true };
  return null;
}
async function runIll(sql, lid, ts) {
  const SQL = await getSQL(); const db = new SQL.Database();
  try { db.exec(illSetupSQL(ILLUS[lid], ts)); const r = db.exec(sql); return r.length ? r[r.length - 1] : { columns: [], values: [] }; } finally { db.close(); }
}
function illSetupSQL(L, ts) {
  const lit = v => v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
  return Object.values(illTables(L, ts)).map(t => (t.ddl || 'CREATE TABLE ' + t.n + ' (' + t.c.join(', ') + ');') + (t.r.length ? '\nINSERT INTO ' + t.n + ' VALUES ' + t.r.map(r => '(' + r.map(lit).join(', ') + ')').join(', ') + ';' : '')).join('\n');
}
function viewIllus(step) {
  const L = ILLUS[step.lesson], sc = L.scenes[step.sc], l = LESSONS[step.lesson];
  if (!F || F.stepIndex !== SESSION.i) F = { stepIndex: SESSION.i, illus: true, run: null };
  const run = sc.sql && !sc.norun ? (F.run || '<button class="btn" data-act="illRun">▶ Run this query</button>') : '';
  const pos = step.of ? 'step ' + step.pos + '/' + step.of : 'picture ' + (step.sc + 1) + '/' + L.scenes.length;
  const lastBtn = L.order ? (step.pos < step.of ? 'Next →' : 'Done →') : step.sc + 1 < L.scenes.length ? 'Next picture →' : 'Got it → questions';
  return '<div class="kicker">' + (step.isNew ? '🆕 New · ' : '') + '🔍 See it first · ' + _h(l.title) + ' · ' + pos + '</div><h2>' + _h(sc.h) + '</h2>' +
    (sc.link ? '<p class="ill-link">' + sc.link + '</p>' : '') + (sc.plan ? planBox(step.lesson, sc.plan) : '') +
    (sc.v10 || sc.tf ? illFigHTML(sc, L, '') + (sc.say ? '<p class="ill-say">' + sc.say + '</p>' : '') + (run ? '<div class="ill-run"><div class="lab">▶ Run in the app (real SQLite on these tables)</div>' + run + '</div>' : '') // v10.1: tables first, then the text walks through them
      : (sc.say ? '<p>' + sc.say + '</p>' : '') + illFigHTML(sc, L, run)) + (sc.note ? '<p class="muted small">' + sc.note + '</p>' : '') +
    '<div class="actions"><button class="btn primary big" data-act="illNext" data-autofocus>' + lastBtn + '</button></div>';
}
function initVQ(step) {
  const q = ILLUS[step.lesson].qs[step.qi];
  const f = { stepIndex: SESSION.i, vq: true, q, sel: [], done: false, ok: null, vals: [] };
  if (q.k === 'mc') f.opts = shuffle(q.o.map((x, i) => ({ x, i })));
  if (q.k === 'run') f.code = q.code;
  if (q.k === 'line') f.lines = q.code.split('\n');
  if (q.k === 'cls') f.vals = q.items.map(() => null);
  return f;
}
function viewVQ(step) {
  const L = ILLUS[step.lesson], l = LESSONS[step.lesson];
  if (!F || F.stepIndex !== SESSION.i) F = initVQ(step);
  const f = F, q = f.q; let h = '<div class="kicker">' + (step.isNew ? '🆕 New · ' : '') + '🔍 ' + (step.back ? 'One step back · ' : step.rv ? 'Review · ' : 'Picture question · ') + _h(l.title) + (step.of ? ' · step ' + step.pos + '/' + step.of : '') + '</div>' + (q.link ? '<p class="ill-link">' + q.link + '</p>' : '') + '<h2 class="q">' + q.q + '</h2>';
  const TS = illTables(L, q.ts); const tabs = Object.values(TS).filter(t => !q.only || q.only.includes(t.n));
  // v10: the tables are open by default (a closed toggle counts as not visible)
  if (q.k !== 'tap' && q.k !== 'tapc' && q.ref !== false && tabs.length) h += '<details class="ill-ref" open><summary>The tables</summary><div class="ill-ins' + (tabs.length === 2 ? ' two' : '') + '">' + tabs.map(t => illTable(t, null, {})).join('') + '</div></details>';
  if (q.sql) h += QY(q.sql);
  if (q.show) h += '<div class="scene">' + q.show + '</div>'; // v8: a table drawn into the question (e.g. spot the badly designed table)
  if (q.k === 'tap') {
    const others = tabs.filter(t => t.n !== q.t);
    if (others.length) h += '<div class="ill-ins dim">' + others.map(t => illTable(t, q.om && q.om[t.n] || null, {})).join('') + '</div>';
    h += illTable(TS[q.t], null, { tap: { sel: f.sel, done: f.done, ans: q.ans }, role: q.role || 'Tap rows to select them' });
    if (!f.done) h += '<div class="actions"><button class="btn primary big" data-act="vqCheck">✓ Check</button></div>';
  } else if (q.k === 'tapc') {
    const others = tabs.filter(t => t.n !== q.t);
    if (others.length) h += '<div class="ill-ins dim">' + others.map(t => illTable(t, null, {})).join('') + '</div>';
    h += illTable(TS[q.t], null, { tapc: { sel: f.sel, done: f.done, ans: q.ans }, role: 'Tap a column header' });
    if (!f.done) h += '<div class="actions"><button class="btn primary big" data-act="vqCheck">✓ Check</button></div>';
  } else if (q.k === 'cls') {
    h += '<div class="cls">' + q.items.map((it, i) => '<div class="cls-i' + (f.done ? (f.vals[i] === it[1] ? ' good' : ' wrong') : '') + '"><div class="cls-q">' + it[0] + '</div><div class="cls-b">' +
      q.cats.map((c, k) => '<button class="chipb' + (f.vals[i] === k ? ' on' : '') + (f.done && k === it[1] ? ' ans' : '') + '" data-act="vqCls" data-i="' + i + '" data-c="' + k + '"' + (f.done ? ' disabled' : '') + ' aria-pressed="' + (f.vals[i] === k) + '">' + c + '</button>').join('') + '</div>' + (f.done && it[2] ? '<div class="small muted cls-w">' + (f.vals[i] === it[1] ? '' : '→ ' + q.cats[it[1]] + '. ') + it[2] + '</div>' : '') + '</div>').join('') + '</div>';
    if (!f.done) h += '<div class="actions"><button class="btn primary big" data-act="vqCheck">✓ Check</button></div>';
  } else if (q.k === 'mc') {
    h += '<div class="opts">' + f.opts.map((o, k) => '<button class="opt' + (f.done ? (o.i === 0 ? ' ok' : f.pick === k ? ' bad' : '') : '') + '" data-act="vqPick" data-k="' + k + '"' + (f.done ? ' disabled' : '') + '>' + o.x + '</button>').join('') + '</div>';
  } else if (q.k === 'line') {
    h += '<div class="qlines">' + f.lines.map((x, i) => '<button class="qline' + (f.done ? (i === q.ans ? ' ok' : f.pick === i ? ' bad' : '') : f.pick === i ? ' on' : '') + '" data-act="vqLine" data-k="' + i + '"' + (f.done ? ' disabled' : '') + '><span class="ln">' + (i + 1) + '</span><code>' + esc(x) + '</code></button>').join('') + '</div>';
    if (!f.done) h += '<div class="actions"><button class="btn primary big" data-act="vqCheck">✓ Check</button></div>';
  } else if (q.k === 'run') {
    h += '<textarea id="vqCode" class="mono editor" rows="6" spellcheck="false" autocapitalize="off"' + (f.done ? ' readonly' : '') + '>' + esc(f.code) + '</textarea>' +
      (f.out ? '<div class="out">' + f.out + '</div>' : '') +
      (!f.done ? '<div class="actions three"><button class="btn" data-act="vqRun">▶ Run</button><button class="btn primary" data-act="vqCheck">✓ Check</button></div>' : '');
  }
  if (!f.done) h += '<button class="btn ghost" data-act="vqIdk">I don\'t know: show me</button>';
  else h += '<div class="feedback ' + (f.ok ? 'good' : 'badfb') + '">' + (f.ok ? '✅ Correct' : '↩️ Not quite. ' + (q.back && !step.back && !step.retry ? 'First one step back with a fresh example, then this question again.' : 'You\'ll see it again.') + (f.msg ? ' ' + esc(f.msg) : '')) + '</div><div class="hintbox">💡 ' + q.why + '</div>' + vqWrongWhy(f) + (q.k === 'line' && q.lw ? '<div class="whyw"><div class="lab">Why that line</div>' + q.lw + '</div>' : '') +
    (q.k === 'run' && !f.ok ? '<div class="lab">A correct query</div>' + QY(q.sol) : '') +
    '<div class="actions"><button class="btn primary big" data-act="next" data-autofocus>Continue</button></div>';
  return h;
}
// v8: multiple choice can explain every wrong option (q.w[i] for option i; the option you picked comes first)
function vqWrongWhy(f) {
  const q = f.q; if (q.k !== 'mc' || !q.w || !f.opts) return '';
  const picked = f.pick >= 0 && f.opts[f.pick] ? f.opts[f.pick].i : -1;
  const ws = q.o.map((o, i) => ({ o, i, w: q.w[i] })).filter(x => x.i !== 0 && x.w).sort((a, b) => (b.i === picked) - (a.i === picked));
  return ws.length ? '<div class="whyw"><div class="lab">Why the other answers are wrong</div><ul>' + ws.map(x => '<li' + (x.i === picked ? ' class="picked"' : '') + '><b>' + x.o + '</b>' + (x.i === picked ? ' <span class="small">(your answer)</span>' : '') + ': ' + x.w + '</li>').join('') + '</ul></div>' : '';
}
function finishVQ(ok, msg) {
  const step = SESSION.steps[SESSION.i]; const vs = visState(step.lesson); const t = today(); const q = F.q; const L = ILLUS[step.lesson];
  visMigrate(step.lesson); const id = vqId(step.lesson, step.qi);
  const r = vs.qid[id] || (vs.qid[id] = { n: 0, ok: null, miss: null }); r.n++; if (ok) r.ok = t; else r.miss = t;
  if (L.rung && q.rv) { // v10: light spaced review for application questions (1, 3, 7, 16 … days; a miss restarts at 1)
    r.ivl = ok ? Math.min(60, Math.round((r.ivl || 0) ? r.ivl * 2.3 : 1)) : 1; r.due = addDays(t, r.ivl); }
  if (q.plan && F.opts && F.pick >= 0) { if (!vs.plan) vs.plan = {}; vs.plan[q.plan] = q.o[0]; }
  F.done = true; F.ok = ok; F.msg = msg || '';
  if (ok) { SESSION.stats.right++; addXP(5); } else { SESSION.stats.wrong++; const key = 'vq' + step.lesson + step.qi;
    if (!step.retry && !step.back && !SESSION.requeued[key]) { SESSION.requeued[key] = true;
      // v10: a miss goes one step back to a fresh example, then the same question again
      const bi = q.back ? L.qs.findIndex(x => x.id === q.back) : -1;
      if (bi >= 0) SESSION.steps.splice(SESSION.i + 1, 0, { type: 'vq', lesson: step.lesson, qi: bi, back: true }, Object.assign({}, step, { retry: true, pos: null, of: null }));
      else SESSION.steps.push(Object.assign({}, step, { retry: true, pos: null, of: null })); } }
  saveTerms(); save();
}
// v10: one-time copy of position-keyed answers to stable IDs (vs.q is left as it was)
function visMigrate(lid) { const vs = visState(lid); if (vs.qid) return; vs.qid = {}; Object.keys(vs.q || {}).forEach(k => { const q = ILLUS[lid] && ILLUS[lid].qs[+k]; if (q && !q.id) vs.qid[lid + '.' + k] = Object.assign({}, vs.q[k]); }); }
function planBox(lid, keys) { const p = (T.vis && T.vis[lid] && T.vis[lid].plan) || {}; const L = ILLUS[lid];
  return '<div class="planbox"><div class="lab">Your plan</div><ul>' + keys.map(k => { const q = L.qs.find(x => x.plan === k); return '<li><b>' + q.pl + ':</b> ' + (p[k] || q.o[0]) + '</li>'; }).join('') + '</ul></div>'; }


const GROUND = {
  row: { name: 'row', tip: 'one line of a table: one record',
    teach: 'A <b>row</b> is one line across a table. It holds one record, here one song\u2019s streams on one day: its date, title and streams.' + SCENE,
    qs: [{ q: 'Tap <b>one row</b> of the daily_streams table.', show: SC_SONGS, tap: [['song_id: 1 · 2 · 3', 0], ['10-17 · 1 · 900', 1], ['streams: 900 · 1200 · 700', 0]], why: 'A row runs across: one song on one day, with all its values. A list down one field is a column.' },
      { q: 'How many rows does the daily_streams table have?', show: SC_SONGS, o: ['3', '4', '2', '9'], why: 'The top line holds the column names (the header), so it is not a row. The 3 lines below are rows.' }] },
  column: { name: 'column', tip: 'one named field, read downwards',
    teach: 'A <b>column</b> is one named field that every row has, such as <code>streams</code>. You read it downwards.' + SCENE,
    qs: [{ q: 'Tap the <b>column</b> <code>song_id</code>.', show: SC_SONGS, tap: [['1 · 2 · 3', 1], ['10-17 · 2 · 1200', 0], ['the whole daily_streams table', 0]], why: 'A column is one field read downwards: here, the song_id of every row.' },
      { q: 'daily_streams has how many columns?', show: SC_SONGS, o: ['3', '4', '1', '9'], why: 'chart_date, song_id and streams: 3 named fields.' }] },
  value: { name: 'value', tip: 'one cell: one piece of data',
    teach: 'A <b>value</b> is one cell: where one row meets one column. For example, the streams value in song 1\u2019s row is 900.' + SCENE,
    qs: [{ q: 'Tap <b>a single value</b>.', show: SC_SONGS, tap: [['900', 1], ['10-17 · 1 · 900', 0], ['streams: 900 · 1200 · 700', 0]], why: 'A value is one cell. A row or a column holds several values.' },
      { q: 'What is the value of streams for song 2?', show: SC_SONGS, o: ['1200', '10-17', 'streams', '3'], why: 'Find the row (song_id 2), then the column (streams): 1200.' }] },
  table: { name: 'table', tip: 'stored rows and columns with a name',
    teach: 'A <b>table</b> is stored data with a name (<code>daily_streams</code>): rows and columns that stay in the database after the query finishes.' + SCENE,
    qs: [{ q: 'Tap the <b>stored table</b> the query reads from.', tap: [[QY(SC_Q), 0], [SC_SONGS, 1], ['the word doubled', 0]], why: 'The query is the instruction. daily_streams is the stored table it reads.' },
      { q: 'In <code>FROM songs</code>, what is songs?', o: ['a table', 'a column', 'a row', 'a value'], why: 'FROM names the table the rows come from.' }] },
  query: { name: 'query', tip: 'an instruction that asks the database for data',
    teach: 'A <b>query</b> is an instruction you send to the database, usually starting with SELECT. It asks for data; it does not store any.' + SCENE,
    qs: [{ q: 'Which of these is a <b>query</b>?', o: ['SELECT song_id FROM daily_streams;', 'daily_streams', 'streams > 800', '1200'], why: 'A query is a full instruction (SELECT … FROM …). The others are a table name, a condition and a value.' },
      { q: 'Tap the <b>query</b>.', tap: [[SC_SONGS, 0], [QY(SC_Q), 1], [SC_RES, 0]], why: 'The query is the text instruction; the tables are data.' }] },
  result: { name: 'result rows', tip: 'the rows a query returns, not the stored table',
    teach: 'The <b>result</b> (the <b>result rows</b>) is what a query returns. It is new output. The stored table is not changed: daily_streams still has 3 rows after this query.' + SCENE,
    qs: [{ q: 'Tap the <b>result rows</b>.', tap: [[LAB('Table daily_streams', SC_SONGS), 0], [QY(SC_Q), 0], [LAB('Output', SC_RES), 1]], why: 'The result is the output the query produced. The daily_streams table is the input.' },
      { q: 'Why do we say ORDER BY sorts the <b>result rows</b>, not the table rows?', o: ['The query returns new rows; the stored table is never reordered', 'Because tables have no rows', 'Because ORDER BY deletes the table rows', 'Because the table is sorted first and then copied'], why: 'Queries read tables and return results. Sorting, filtering and limiting all shape the result only.' }] },
  expression: { name: 'expression', tip: 'anything that produces a value for each row',
    teach: 'An <b>expression</b> is anything that produces a value for each row: a column (<code>streams</code>), a calculation (<code>streams * 2</code>) or a function call (<code>UPPER(title)</code>). A table name is not an expression.' + SCENE,
    qs: [{ q: 'Tap the expression that <b>calculates</b> a new value.', inline: true, tap: [['SELECT ', null], ['song_id', 0], [', ', null], ['streams * 2', 1], [' AS doubled FROM ', null], ['daily_streams', 0], [';', null]], why: 'streams * 2 computes a value for each row. song_id is a plain column; daily_streams is a table.' },
      { q: 'Which of these can be <b>expressions</b>: price, price * qty, the table name orders?', o: ['price and price * qty', 'only price * qty', 'price, price * qty and orders', 'only orders'], why: 'A column is the simplest expression (it gives a value per row). A table name gives no value, so it is not one.' }] },
  condition: { name: 'condition', tip: 'a test that is TRUE, FALSE or UNKNOWN for each row',
    teach: 'A <b>condition</b> is a test such as <code>streams &gt; 800</code>. It is checked for each row and gives TRUE or FALSE (or UNKNOWN with NULL).' + illFigHTML(ILL_COND, null),
    qs: [{ q: 'Tap the <b>condition</b>.', inline: true, tap: [['SELECT ', null], ['song_id', 0], [' FROM ', null], ['daily_streams', 0], [' WHERE ', null], ['streams > 800', 1], [' ORDER BY ', null], ['streams DESC', 0]], why: 'streams > 800 is the test; WHERE uses it to keep rows.' },
      { q: 'For song 3\u2019s row (700 streams), what is <code>streams &gt; 800</code>?', show: SC_SONGS, o: ['FALSE', 'TRUE', 'UNKNOWN', '700'], why: '700 is not greater than 800, so the test is FALSE for that row and WHERE drops it.' }] },
  clause: { name: 'clause', tip: 'one part of a query that starts with a keyword',
    teach: 'A <b>clause</b> is one part of a query that starts with a keyword: <code>SELECT …</code>, <code>FROM …</code>, <code>WHERE …</code>, <code>ORDER BY …</code>.' + SCENE,
    qs: [{ q: 'Tap the <b>WHERE clause</b>.', inline: true, tap: [['SELECT song_id', 0], [' ', null], ['FROM daily_streams', 0], [' ', null], ['WHERE streams > 800', 1], [' ', null], ['ORDER BY streams DESC', 0]], why: 'A clause is the keyword plus its part: WHERE streams > 800.' },
      { q: 'Which of these is a whole <b>clause</b>?', o: ['ORDER BY streams DESC', 'DESC', 'streams', '>'], why: 'A clause starts with its keyword and includes its part. DESC, streams and > are only pieces of clauses.' }] },
  key: { name: 'key', tip: 'a column whose values identify rows',
    teach: '<b>Key</b> columns identify rows. <code>artists.artist_id</code> gives every artist a unique number; <code>songs.artist_id</code> uses that number to point at an artist.' + '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>',
    qs: [{ q: 'Which column identifies each artist?', show: '<div class="scene">' + LAB('artists', SC_ART) + '</div>', o: ['artist_id', 'name (names can repeat)', 'the row number on screen', 'the first row'], why: 'artist_id is unique per artist and never missing. Two artists can share a name, and the order rows are shown in is not stored.' },
      { q: 'In songs, which column points to an artist?', show: '<div class="scene">' + LAB('songs', SC_SNG) + '</div>', o: ['artist_id', 'song_id', 'title', 'none'], why: 'songs.artist_id holds artists\u2019 key values, linking each song to one artist.' }] },
  datatype: { name: 'data type', tip: 'what kind of value a column holds',
    teach: 'A <b>data type</b> says what kind of value a column holds: INTEGER (whole numbers), TEXT, DATE, BOOLEAN …',
    qs: [{ q: 'streams holds 900, 1200, 700. Its data type is…', show: SC_SONGS, o: ['INTEGER (whole numbers)', 'TEXT', 'DATE', 'BOOLEAN'], why: 'Whole numbers are INTEGER.' },
      { q: 'Which value is TEXT?', o: ["'Rush'", '900', 'TRUE', '2.5'], why: 'Text values are written in quotes in SQL.' }] },
  schema: { name: 'schema', tip: 'the structure, not the data',
    teach: 'The <b>schema</b> is the structure: which tables exist, their columns and data types. The rows are the data that fill that structure.',
    qs: [{ q: 'Which of these is part of the <b>schema</b>, not the data?', o: ['streams is an INTEGER column of daily_streams', 'song 1 had 900 streams on 10-17', 'there are 3 rows for 10-17', 'Rema is an artist'], why: 'Column names and types are structure. The others are facts stored as data.' },
      { q: 'Someone renames the column streams to plays. What changed?', o: ['the schema', 'only the data', 'nothing', 'only the query result'], why: 'Names and types of columns are the schema.' }] },
  func: { name: 'function', tip: 'takes input values and returns a value',
    teach: 'A <b>function</b> takes input values and returns a value: <code>UPPER(title)</code>, <code>ROUND(x, 1)</code>, in Python <code>len(rows)</code>.',
    qs: [{ q: 'Tap the <b>function name</b>.', inline: true, tap: [['SELECT ', null], ['UPPER', 1], ['(', null], ['title', 0], [') FROM ', null], ['songs', 0], [';', null]], why: 'UPPER is the function; title is its input; songs is the table.' },
      { q: 'What does <code>UPPER(\'rush\')</code> return?', o: ["'RUSH'", "'rush'", 'a table', 'TRUE'], why: 'The function takes one input value and returns one value.' }] },
  pipeline: { name: 'pipeline', tip: 'automated steps that move data from source to target',
    teach: 'A <b>pipeline</b> is a set of automated steps that moves data from a source to a target: API → extract → transform → load → table.',
    qs: [{ q: 'Which is a <b>pipeline</b>?', o: ['a script that pulls the chart API, cleans it and loads a table every morning', 'a single SELECT you run once by hand', 'a CSV file', 'a dashboard'], why: 'A pipeline is repeatable, automated steps from source to target.' },
      { q: 'In API → extract → transform → load → table, what is the pipeline?', o: ['the whole chain of steps', 'only the API', 'only the table', 'only the load step'], why: 'The pipeline is all the steps together.' }] },
  run: { name: 'run', tip: 'one execution of a job',
    teach: 'A <b>run</b> is one execution of a job. The same code can run many times: every morning, or again by hand after a failure.',
    qs: [{ q: 'The pipeline is scheduled 07:17 daily. On Tuesday it fails at 07:17 and you re-run it at 09:00. How many runs on Tuesday?', o: ['2', '1', '0', '3'], why: 'Each execution is a run, failed or not.' },
      { q: 'A <b>run</b> is…', o: ['one execution of a job', 'the code file', 'the schedule', 'the table it writes'], why: 'Code is written once; it runs many times.' }] },
  batch: { name: 'batch', tip: 'a bounded chunk of data processed together',
    teach: 'A <b>batch</b> is a bounded chunk of data (it has a start and an end, e.g. one day of chart data) processed together.',
    qs: [{ q: 'Which is a <b>batch</b>?', o: ['all of yesterday\u2019s orders processed together at 01:00', 'each click processed the moment it happens', 'the database server', 'a column'], why: 'A batch is a bounded set handled together. Handling events one by one as they come is streaming.' },
      { q: 'A batch is <b>bounded</b>. That means…', o: ['it has a known start and end, such as one day of data', 'it never ends', 'it is always small', 'it is in memory'], why: 'Bounded = finite, with a clear start and end.' }] },
  partition: { name: 'partition', tip: 'the rows that share one value of a split column',
    teach: 'When a table is split by a column such as <code>chart_date</code>, each <b>partition</b> is the set of rows that share one value: all the rows of 10-16 form one partition, and all the rows of 10-17 form another. In a small DuckDB table this is just a way of naming those rows; warehouses can also store each partition separately.' + SC_PART,
    qs: [{ q: 'The table is split by chart_date. Which rows form one partition?', show: SC_PART, o: ['all rows with chart_date 10-17', 'the first row', 'the streams column', 'every row in the table'], why: 'One partition = all rows that share one value of the split column.' },
      { q: 'Reloading only today\u2019s partition means…', o: ['only today\u2019s rows are replaced; other days are untouched', 'the whole table is replaced', 'a new column is added', 'today\u2019s rows are duplicated'], why: 'Partitions let a job touch only the part it needs.' }] },
  entity: { name: 'entity', tip: 'a thing that exists on its own, with its own table and ID',
    teach: 'An <b>entity</b> is a thing that exists on its own and that we store facts about: an artist, a song, a listener. Each one gets its own table, one row per thing, with its own ID.' + '<div class="scene">' + LAB('artists (an entity table)', MT(['artist_id', 'name'], [[1, 'Burna Boy'], [2, 'Tems']])) + '</div>',
    qs: [{ q: 'Which is an <b>entity</b>?', o: ['a song', 'a listener\u2019s current city', 'a play at 21:14', '"song belongs to artist"'], why: 'A song exists on its own. A current city is a changing fact (state), a play is an event, and "belongs to" is a relationship.' },
      { q: 'Tap the table that stores an <b>entity</b>.', tap: [[LAB('artists', MT(['artist_id', 'name'], [[1, 'Burna Boy'], [2, 'Tems']])), 1], [LAB('streams', MT(['listener_id', 'song_id', 'streamed_at'], [[100, 10, '21:14'], [101, 10, '22:02']])), 0]], why: 'artists describes things that exist on their own. streams records events (plays).' }] },
  event: { name: 'event', tip: 'a small record that something happened, with a time',
    teach: 'An <b>event</b> is a small record that something happened at a time: "user 42 played Rush at 07:03:12".',
    qs: [{ q: 'Which is an <b>event</b>?', o: ['"user 42 played Rush at 07:03:12"', 'the songs table', 'a SELECT query', 'a CSV header'], why: 'An event records one thing that happened, with its time.' },
      { q: 'Events arrive…', o: ['continuously, one after another', 'once a year in one file', 'only when you run a query', 'never: they are stored rules'], why: 'Events keep coming; stream processing handles them as they arrive.' }] },
  api: { name: 'API', tip: 'a URL your code calls to get data',
    teach: 'An <b>API</b> is a URL your code calls to get data, here <code>requests.get(chart_url)</code> returning JSON.',
    qs: [{ q: 'The Deezer chart <b>API</b> is…', o: ['a URL your code calls that returns data (JSON)', 'a database table', 'a Python file', 'a scheduler'], why: 'Your code sends a request; the API answers with data.' },
      { q: 'An API call can fail. Which is a failed call?', o: ['HTTP status 500', 'HTTP status 200 with JSON', 'a list of 100 songs', 'a page of results'], why: '4xx and 5xx statuses are errors; 200 is success.' }] },
  test: { name: 'test', tip: 'code that checks other code with known input',
    teach: 'A <b>test</b> is code that runs your code with known input and checks the output, e.g. <code>assert transform(raw) == expected</code>.',
    qs: [{ q: 'Which is a <b>test</b>?', o: ['a function that runs transform() on sample JSON and asserts the rows', 'transform() itself', 'a log line', 'the API'], why: 'A test checks other code against an expected result.' },
      { q: 'A test fails. What does that tell you?', o: ['the code did not give the expected result for that input', 'the network is down', 'the table is empty', 'nothing'], why: 'Failing = actual output differs from expected.' }] }
};

const TERM_BLOCKS = {
  'sqlt-t1': ['row', 'column', 'value'], 'sqlt-t2': ['column', 'value', 'datatype'], 'sqlt-t3': ['row', 'value', 'table'],
  'sqlr-t1': ['table', 'row', 'key'], 'sqlr-t2': ['entity', 'column', 'value'], 'sqlr-t3': ['entity', 'row', 'event'], 'sqlr-t4': ['entity', 'key'], 'sqlr-t5': ['entity', 'row', 'key'], 'sqlr-t6': ['entity', 'table', 'key'],
  'sqlm-t1': ['entity', 'row', 'key'], 'sqlm-t2': ['table', 'key', 'row'],
  'sql1-t1': ['row', 'column'], 'sql1-t2': ['column', 'row', 'value'], 'sql1-t3': ['column', 'key', 'table'], 'sql1-t4': ['query', 'result'], 'sql1-t5': ['table', 'column', 'datatype'],
  'sql2-t1': ['condition', 'row', 'clause'], 'sql2-t2': ['value', 'column'], 'sql2-t3': ['condition', 'value'], 'sql2-t4': ['value', 'condition', 'query'], 'sql2-t5': ['value', 'condition'],
  'sql3-t1': ['result', 'expression'], 'sql3-t2': ['result', 'row'], 'sql3-t3': ['result', 'row', 'column'], 'sql3-t4': ['clause', 'query'], 'sql3-t5': ['table', 'row'],
  'sql4-t1': ['func', 'row', 'value'], 'sql4-t2': ['row', 'column', 'func'], 'sql4-t3': ['condition', 'row', 'clause'], 'sql4-t4': ['row', 'table', 'result'], 'sql4-t5': ['func', 'row', 'value'],
  'sql5-t1': ['row', 'table', 'column', 'key'], 'sql5-t2': ['row', 'table'], 'sql5-t3': ['row', 'table', 'value'], 'sql5-t4': ['row', 'table'], 'sql5-t5': ['row', 'table', 'key'],
  'sql6-t1': ['query', 'result'], 'sql6-t2': ['query', 'result', 'value'], 'sql6-t3': ['query', 'row', 'column'], 'sql6-t4': ['query', 'row', 'condition'], 'sql6-t5': ['query', 'clause', 'table'],
  'sql7-t1': ['query', 'result'], 'sql7-t2': ['query'], 'sql7-t3': ['query', 'row'], 'sql7-t4': ['row', 'result'],
  'sql8-t1': ['func', 'row', 'result'], 'sql8-t2': ['row', 'func'], 'sql8-t3': ['row', 'value', 'func'], 'sql8-t4': ['func', 'row', 'value'], 'sql8-t5': ['row', 'func'],
  'sql9-t1': ['expression', 'condition', 'value'], 'sql9-t2': ['func', 'value'], 'sql9-t3': ['value', 'datatype'], 'sql9-t4': ['func', 'value'], 'sql9-t5': ['value', 'datatype', 'expression'],
  'pj1-t1': ['pipeline', 'batch', 'run'], 'pj1-t2': ['run', 'table'], 'pj1-t3': ['pipeline', 'func'], 'pj1-t4': ['row', 'key'],
  'pj2-t1': ['api', 'result'], 'pj2-t2': ['api', 'func'], 'pj2-t3': ['api', 'run'], 'pj2-t4': ['api', 'run'],
  'pj3-t1': ['row', 'column', 'value'], 'pj3-t2': ['func', 'value'], 'pj3-t3': ['run', 'condition'], 'pj3-t4': ['value', 'func'],
  'pj4-t1': ['table', 'schema'], 'pj4-t2': ['table', 'run'], 'pj4-t3': ['key', 'column', 'row'], 'pj4-t4': ['partition', 'run', 'row'], 'pj4-t5': ['table', 'query'], 'pj4-t6': ['query', 'value'],
  'pj5-t1': ['query', 'result', 'table'], 'pj5-t2': ['query', 'run'], 'pj5-t3': ['func', 'row'], 'pj5-t4': ['expression', 'value'], 'pj5-t5': ['row', 'func'],
  'pj6-t1': ['test', 'func'], 'pj6-t2': ['test'], 'pj6-t3': ['test'], 'pj6-t4': ['test'], 'pj6-t5': ['test'],
  'pj7-t1': ['run'], 'pj7-t2': ['run', 'pipeline'], 'pj7-t3': ['run'], 'pj7-t4': ['test', 'run', 'pipeline'],
  'pj8-t1': ['pipeline', 'run'], 'pj8-t2': ['run', 'pipeline'], 'pj8-t3': ['func'], 'pj8-t4': ['run'],
  'pj9-t1': ['row', 'value'], 'pj9-t2': ['row', 'value'], 'pj9-t3': ['row', 'table'], 'pj9-t4': ['result', 'row'],
  'etl1-t1': ['pipeline', 'api'], 'etl1-t2': ['pipeline', 'row'], 'etl1-t3': ['pipeline', 'table'], 'etl1-t4': ['pipeline', 'table'], 'etl1-t5': ['pipeline', 'run'],
  'etl2-t1': ['run', 'pipeline', 'row'], 'etl2-t2': ['row', 'key'], 'etl2-t3': ['run', 'row'], 'etl2-t4': ['run', 'value'], 'etl2-t5': ['run', 'pipeline'],
  'etl3-t1': ['batch', 'run'], 'etl3-t2': ['event'], 'etl3-t3': ['event', 'pipeline'], 'etl3-t4': ['event'], 'etl3-t5': ['event', 'batch'],
  'etl4-t1': ['condition', 'pipeline'], 'etl4-t2': ['pipeline', 'run'], 'etl4-t3': ['schema', 'api'], 'etl4-t4': ['test', 'func'], 'etl4-t5': ['row', 'run'],
  'etl5-t1': ['partition', 'table'], 'etl5-t2': ['pipeline'], 'etl5-t3': ['pipeline', 'run'], 'etl5-t4': ['run', 'pipeline']
};

const SC_GENRE = MT(['title', 'genre'], [['Last Last', 'Afrobeats'], ['Free Mind', null], ['Calm Down', 'Afrobeats']]); // songs; Free Mind (Tems) not tagged yet
const TERMS4 = {
  // ---- v8: what's inside a table
  'sqlt-t1': { t1: { def: 'A cell is {the single value} {where one row meets one column}.', ph: [
    { a: ['one single value', 'just one value'], d: [['a whole row of values', 'A row holds many values, one per column. A cell is only one of them.'], ['a whole column of values', 'A column holds one value per row. A cell is one of those values.'], ['the name of a column', 'The name is the header (part of the schema). A cell holds data.']],
      spot: { q: 'In songs, which of these is a <b>cell</b>?', show: MT(['song_id', 'title', 'duration_sec'], [[2, 'SLICK', 106], [11, 'Goodbye (Warm Up)', 163]]), o: ['163, the duration of Goodbye', 'the whole SLICK row', 'the duration_sec column', 'the table name songs'], why: 'A cell is one value at one row and one column. A row or a column holds several cells.' } },
    { a: ['where one row and one column cross', 'at the meeting of one row and one column'], d: [['where each row meets each column', 'Precision: ONE row and ONE column. "Each row meets each column" describes every cell of the table, not a single cell.'], ['where one table meets one column', 'A cell sits inside one table, at one row and one column.'], ['where two rows meet', 'Rows never cross each other. A row crosses columns.']],
      spot: { q: 'To read Calm Down\u2019s duration, what do you need?', o: ['the Calm Down row and the duration_sec column', 'every row and the duration_sec column', 'the Calm Down row and every column', 'only the songs table'], why: 'One row (which song) plus one column (which fact) pins down one cell.' } }] },
    t3: 'In the relational model every cell holds one atomic value (first normal form), never a list such as "1, 11"; a missing value is NULL, which means unknown, not zero or empty text.' },
  'sqlt-t2': { t1: { def: 'A data type is {the kind of value a column may hold}, {such as INTEGER or TEXT}; {every value in that column must fit it}.', ph: [
    { a: ['the kind of value a column can hold', 'what kind of value a column holds'], d: [['the kind of value a row may hold', 'Types belong to COLUMNS: every value down a column has the same type. A row mixes types (a TEXT title, an INTEGER duration).'], ['the number of values a column holds', 'That is a count, not a type.'], ['the name of a column', 'The name says what the column means. The type says what kind of value fits.']],
      spot: { q: 'duration_sec holds 159, 106 and 163. What is its data type?', o: ['INTEGER', 'TEXT', 'DATE', 'BOOLEAN'], why: 'Whole numbers are INTEGER.' } },
    { a: ['for example INTEGER or TEXT', 'like INTEGER, TEXT or DATE'], d: [['for example songs or artists', 'Those are tables, not types.'], ['for example SELECT or WHERE', 'Those are SQL keywords.'], ['for example 159 or Calm Down', 'Those are values. Their types are INTEGER and TEXT.']],
      spot: { q: 'Which of these is a <b>data type</b>?', o: ['TEXT', 'title', 'Calm Down', 'songs'], why: 'TEXT is a type. title is a column, Calm Down is a value, songs is a table.' } },
    { a: ['every value in that column must fit it', 'each value in the column has to match it'], d: [['one value in that column must fit it', 'Precision: EVERY value. A type is a rule for the whole column, not for one cell.'], ['every value in that row must fit it', 'The rule runs down a column, not across a row.'], ['values can be any kind', 'Then the type would mean nothing, and sums and sorting would break.']],
      spot: { q: 'A shop stores price as TEXT and one row says \'ten\'. What goes wrong?', o: ['SUM(price) and sorting by price break: price should be a number type such as DECIMAL', 'nothing', 'the table gets a new column', 'that row becomes the primary key'], why: 'The type is the column\u2019s rule. With the right type, \'ten\' would be refused.' } }] },
    t3: 'Choosing a data type is a design decision: it refuses invalid values, decides how values sort and compare (as text, "10" sorts before "9"), and sets storage size; money uses an exact DECIMAL rather than FLOAT, and dates use DATE or TIMESTAMP rather than free text.' },
  'sqlt-t3': { t1: { def: 'Redundancy is {the same fact stored in more than one place}; {every change must be repeated on every copy}.', ph: [
    { a: ['the same fact stored in several places', 'one fact kept in more than one place'], d: [['different facts stored in one place', 'That is just a table with columns. Redundancy is ONE fact with many copies.'], ['the same fact stored once', 'Storing it once is the cure, not the problem.'], ['a fact that is missing', 'Missing is NULL. Redundancy is having too many copies.']],
      spot: { q: 'Which describes this table?', show: MT(['chart_date', 'title', 'artist', 'genre'], [['10-16', 'Heaven Baby', 'Ayra Starr', 'Afrobeats'], ['10-17', 'Heaven Baby', 'Ayra Starr', 'Afrobeats']]), o: ['redundancy: the song\u2019s title, artist and genre are copied on every chart row', 'no redundancy: every row has a different date', 'redundancy only appears when there are NULLs', 'redundancy only appears without a primary key'], why: 'Title, artist and genre are facts about the song (and its artist), copied once per chart row. Only the date changes.' } },
    { a: ['every change must be made to every copy', 'each update has to be repeated on all copies'], d: [['one change updates every copy automatically', 'Nothing links the copies. You must find and change each one, and missing one makes the data disagree.'], ['every change must be made to one copy', 'If only one copy changes, the copies disagree.'], ['copies can never change', 'They can and do. That is exactly the risk.']],
      spot: { q: 'An artist\u2019s stage name is copied on 300 chart rows and the artist changes it. What must happen?', o: ['all 300 rows must be updated; miss one and the data disagrees', 'update one row', 'nothing: names never change', 'delete the table'], why: 'Every copy must change. Storing the name once, in artists, makes it one UPDATE.' } }] },
    t3: 'Redundancy causes update, insert and delete anomalies; normalization removes it by storing each fact once, in the table whose key it depends on, while warehouses sometimes add it back on purpose (denormalized tables) for faster reads and then rely on the pipeline to keep the copies in sync.' },
  // ---- v7: entities, state, events, relationships, many-to-many
  'sqlr-t1': { t1: { def: 'An entity is {a thing that exists on its own} {that we store facts about}, {with its own table and ID}.', ph: [
    { a: ['something that exists by itself', 'a thing that exists independently'], d: [['a thing that only exists when something happens', 'That is an event. An entity (an artist) exists whether or not anything happens.'], ['a column that changes over time', 'That is state: a fact about an entity, not the entity itself.'], ['a link between two tables', 'That is a relationship.']],
      spot: { q: 'Which of these is an <b>entity</b>?', o: ['a listener', 'a stream at 21:14', 'an artist\u2019s current label', '"song belongs to artist"'], why: 'A listener exists on its own. The stream is an event, the label is state, and "belongs to" is a relationship.' } },
    { a: ['that we keep facts about', 'that we record facts about'], d: [['that we delete facts about', 'We store facts about it. Deleting is not the point.'], ['that we store queries about', 'We store facts (data), not queries.'], ['that stores no facts', 'An entity is exactly what the facts (columns) describe.']],
      spot: { q: 'In <code>artists(artist_id, name, current_label)</code>, what are name and current_label?', o: ['facts about the artist entity', 'other entities', 'events', 'relationships'], why: 'Columns hold facts about the entity the row stands for: its main stage name and the label it is signed to now.' } },
    { a: ['with its own table and primary key', 'with its own table and its own ID'], d: [['with its own column and ID', 'An entity gets a whole table. One column is just a fact.'], ['sharing a table with every other entity', 'Each entity has its own table, so each fact is stored once.'], ['with its own table but no ID', 'The ID (primary key) is how other tables point at it.']],
      spot: { q: 'Listeners are a new entity. What do you create?', o: ['a listeners table with a listener_id primary key', 'a listener column in songs', 'a new row in artists', 'nothing: listeners are events'], why: 'A new entity gets its own table and its own ID.' } }] } },
  'sqlr-t2': { t1: { def: 'State is {a current fact about an entity that can change}; {an UPDATE overwrites the old value}.', ph: [
    { a: ['a current, changeable fact about an entity', 'a fact about an entity that can change'], d: [['a fact about an entity that never changes', 'State changes: current labels, cities, account balances.'], ['something that happened at a moment', 'That is an event: recorded once and never changed.'], ['a thing that exists on its own', 'That is an entity. State is a fact ABOUT an entity.']],
      spot: { q: 'Which is <b>state</b>?', o: ['Ada currently lives in Lagos', 'Ada streamed Calm Down at 21:14', 'Rema (an artist)', 'songs.artist_id points at artists'], why: 'Ada\u2019s current city is a fact about her that can change (state). The stream is an event, Rema is an entity, and the pointer is a relationship.' } },
    { a: ['an UPDATE replaces the old value', 'updating overwrites the previous value'], d: [['an UPDATE adds a new row', 'Adding a new row each time is how events are stored. UPDATE changes the existing row.'], ['an UPDATE keeps the old value automatically', 'The old value is lost unless you keep history on purpose.'], ['an INSERT overwrites the old value', 'INSERT adds rows. UPDATE overwrites values.']],
      spot: { q: 'Imagine Burna Boy\u2019s label changes from Spaceship to Atlantic and we run <code>UPDATE artists SET current_label = \'Atlantic\' WHERE artist_id = 1</code>. Where is "Spaceship" now?', o: ['gone, unless we kept history on purpose', 'in a second row for Burna Boy', 'in the streams table', 'still in the current_label column'], why: 'UPDATE overwrites. To keep the old value you need a history table (or a slowly changing dimension).' } }] } },
  'sqlr-t3': { t1: { def: 'An event is {something that happened at a moment}; {it is stored as a new row with a timestamp} {and is normally not edited (mistakes get a correction)}.', ph: [
    { a: ['something that happened at a point in time', 'an occurrence at a specific moment'], d: [['something that exists on its own', 'That is an entity.'], ['a current fact that can change', 'That is state.'], ['something that will happen later', 'Events are recorded after they happen.']],
      spot: { q: 'Which is an <b>event</b>?', o: ['Ada streamed Last Last at 21:14', 'Ada (a listener)', 'Ada\u2019s current city', 'Last Last belongs to Burna Boy'], why: 'Only the stream happened at a moment. A current city is state; "belongs to" is a relationship.' } },
    { a: ['each one is a new row with a timestamp', 'it is recorded as a new row with its time'], d: [['it is stored by updating a row', 'Events add rows. Updating would erase the earlier event.'], ['it is stored as a new column', 'Each event is a row, not a column.'], ['it is stored as a new table', 'There is one events table with one row per event.']],
      spot: { q: 'Ada streams Last Last again tomorrow. What happens in <code>streams</code>?', show: MT(['stream_id', 'listener_id', 'song_id', 'streamed_at'], [[1, 100, 10, '21:14']]), o: ['a new row is added', 'row 1 is updated with the new time', 'nothing: she already streamed it', 'a new column is added'], why: 'Every play is a new event row, and the earlier rows stay as they were.' } },
    { a: ['and is not edited in normal use', 'and normally stays as it was recorded'], d: [['and can never be changed, even when it is wrong', 'Too strong. A wrong event is fixed deliberately: a new correcting row, or a controlled, logged update.'], ['and is updated whenever facts change', 'That describes state. An event stays as it happened.'], ['and changes when the entity changes', 'The event records what happened then. It does not follow later changes.']],
      spot: { q: 'Tems changes her label next year. What happens to this year\u2019s stream rows for her songs?', o: ['nothing: past events stay as they were', 'they are updated to the new label', 'they are deleted', 'they move to a new table'], why: 'Events record what happened at that moment. A label change is new state; it is not a mistake in the old events, so they are not corrected.' } }] } },
  'sqlr-t4': { t1: { def: 'A relationship is {how entities connect}: {a fact stored as a foreign key}, {or a link created by an event}.', ph: [
    { a: ['how entities are connected', 'the way entities link to each other'], d: [['how columns are sorted', 'Sorting is ORDER BY.'], ['how one entity changes over time', 'That is state changing.'], ['how tables are stored on disk', 'Storage is not the logical link.']],
      spot: { q: 'Which is a <b>relationship</b>?', o: ['Last Last belongs to Burna Boy', 'Burna Boy (an artist)', 'Burna Boy\u2019s current label', 'a stream at 21:14'], why: '"Belongs to" connects two entities. The others are an entity, state and an event.' } },
    { a: ['a fact stored in a foreign key', 'a link held by a foreign key column'], d: [['a fact stored in a primary key', 'The primary key identifies the row itself. The link is the foreign key that points at another table.'], ['a fact stored in a comment', 'It is stored as data, in a foreign key column.'], ['a fact copied into every column', 'It is stored once, in one foreign key column.']],
      spot: { q: 'Where is "this song\u2019s main artist" stored?', show: MT(['song_id', 'title', 'artist_id'], [[10, 'Last Last', 1], [11, 'Free Mind', 2]]), o: ['songs.artist_id', 'songs.song_id', 'songs.title', 'nowhere'], why: 'The foreign key column songs.artist_id stores each song\u2019s main artist.' } },
    { a: ['or a link that an event creates', 'or a connection made by events'], d: [['or a link that exists before anything happens', 'Listener–song links do not exist until a stream happens.'], ['or a link created by a query', 'Queries read links. They do not create them in the data.'], ['or a link created by sorting', 'Sorting creates nothing.']],
      spot: { q: 'Zainab has never streamed anything. How is she related to songs?', o: ['not at all yet: the link appears when a stream event is stored', 'through listeners.song_id', 'through artists', 'every listener is linked to every song'], why: 'Listener–song links are created by events. No stream row means no link.' } }] } },
  'sqlr-t5': { t1: { def: 'One-to-many means {one row on one side matches many rows on the other}; {the foreign key sits on the many side}.', ph: [
    { a: ['one row relates to many rows in the other table', 'one row on one side links to many on the other'], d: [['many rows on each side match many on the other', 'That is many-to-many.'], ['one row matches exactly one row', 'That is one-to-one.'], ['one column matches many columns', 'Relationships are between rows, not columns.']],
      spot: { q: 'An artist has many songs, and each song has one main artist. Which relationship is that?', o: ['one-to-many', 'one-to-one', 'many-to-many', 'no relationship'], why: 'One artist row is linked to many song rows, and each song row points at one artist, so it is one-to-many.' } },
    { a: ['the foreign key is on the many side', 'the many side holds the foreign key'], d: [['the foreign key sits on the one side', 'An artists row cannot hold one song_id per song. Each song holds its artist_id.'], ['the foreign key sits in both tables', 'One foreign key on the many side is enough.'], ['the primary key sits on the many side', 'Both tables have primary keys. The point is where the FOREIGN key goes.']],
      spot: { q: 'Artist 1 has songs 10 and 13. Where is that link stored?', o: ['songs.artist_id, on each song row', 'artists.song_id', 'in a list inside artists.name', 'nowhere'], why: 'The many side (songs) holds the foreign key.' } }] } },
  'sqlr-t6': { t1: { def: 'An ERD is {a diagram of entities and their relationships}: {tables as boxes, relationships as lines}.', ph: [
    { a: ['an entity-relationship diagram', 'a diagram of tables and how they relate'], d: [['a list of queries', 'An ERD draws structure, not queries.'], ['a chart of query results', 'It is about the schema, not results.'], ['a diagram of pipeline steps', 'That is a pipeline (DAG) diagram.']],
      spot: { q: 'Before writing a join across 4 tables, what shows you which keys connect them?', o: ['the ERD', 'the result of SELECT *', 'the ORDER BY clause', 'the row count'], why: 'The ERD shows the tables and the key lines between them.' } },
    { a: ['boxes for tables, lines for relationships', 'tables drawn as boxes joined by lines'], d: [['boxes for rows, lines for columns', 'Boxes are tables (entities), not single rows.'], ['boxes for queries, lines for results', 'An ERD has no queries.'], ['lines for tables, boxes for relationships', 'It is the other way round.']],
      spot: { q: 'In an ERD, a line runs from songs.artist_id to artists.artist_id. What does it mean?', o: ['songs.artist_id is a foreign key pointing at artists', 'songs and artists have the same rows', 'artists is sorted by songs', 'both tables must be deleted together'], why: 'Lines connect a foreign key to the primary key it references.' } }] } },
  'sqlm-t1': { t1: { def: 'Many-to-many means {each row on either side can relate to many rows on the other}; {it needs a linking table}.', ph: [
    { a: ['rows on both sides can each relate to many rows', 'each side can have many matches on the other'], d: [['each row on one side relates to many on the other', 'That is one-to-many. Many-to-many goes both ways.'], ['each row relates to exactly one row', 'That is one-to-one.'], ['each column relates to many columns', 'It is about rows.']],
      spot: { q: 'A listener streams many songs, and a song is streamed by many listeners. Which relationship is that?', o: ['many-to-many', 'one-to-many', 'one-to-one', 'none'], why: 'There are many on both sides.' } },
    { a: ['it is stored in a linking table', 'it needs a junction table'], d: [['it needs a foreign key in one of the two tables', 'One column holds one value per row, so it cannot list many songs.'], ['it needs a bigger primary key', 'Key size is not the problem. You need a table of pairs.'], ['it cannot be stored in SQL', 'It can, with a linking table.']],
      spot: { q: 'Where do you store "Last Last is on both Naija Hits and Chill Vibes"?', o: ['in a playlist_songs table, one row per pair', 'in a playlist column of songs, as "Naija Hits, Chill Vibes"', 'in two copies of the songs row', 'in the playlists name column'], why: 'One row per (playlist, song) pair in a linking table.' } }] } },
  'sqlm-t2': { t1: { def: 'A junction table {has one row per pair of related IDs}; {each ID is a foreign key to one side}.', ph: [
    { a: ['holds one row for each related pair', 'has a row for every linked pair'], d: [['has one row per entity', 'Entity tables have one row per entity. The junction has one row per pair.'], ['has one column per pair', 'Pairs are rows, not columns.'], ['has one row per table', 'It has one row per linked pair.']],
      spot: { q: 'playlist_songs has rows (1,10), (1,12), (2,10). What does each row mean?', show: MT(['playlist_id', 'song_id'], [[1, 10], [1, 12], [2, 10]]), o: ['one song on one playlist', 'one playlist', 'one song', 'one listener'], why: 'Each row is one pair: this song is on this playlist.' } },
    { a: ['each ID is a foreign key to one of the tables', 'each column points to one side'], d: [['each ID is a primary key only, pointing nowhere', 'They point outward to the two entity tables as foreign keys. Together they often also form the junction\u2019s own key.'], ['each ID points to the same table', 'One points to each side.'], ['each ID is a copied name', 'They are IDs, not names.']],
      spot: { q: 'In playlist_songs, what does song_id point to?', o: ['songs.song_id', 'playlists.playlist_id', 'playlist_songs itself', 'nothing'], why: 'It is a foreign key to the songs table.' } }] } },
  'sql1-t1': { t1: { def: 'A table is {a named set of rows and columns}; {each row is one record}.', ph: [
    { a: ['a named collection of rows and columns', 'named rows and columns'], d: [['a named set of rows', 'A table has rows AND columns: columns name the fields, rows hold the records.'], ['a named list of columns', 'Columns alone are only the structure; the rows hold the data.'], ['a named set of files', 'A table lives inside the database; it is not a set of files.']],
      spot: { q: 'Tap the <b>table</b>.', tap: [[QY('SELECT song_id FROM daily_streams;'), 0], [SC_SONGS, 1], ['900', 0]], why: 'The table is the stored grid of rows and columns. The query only reads it, and 900 is one value in it.' } },
    { a: ['every row is one record', 'each row holds one record'], d: [['each column is one record', 'A column is one field (like streams). A record runs across a row.'], ['each row is one table', 'A row is one record inside the table.'], ['each row is many records', 'One row = one record, e.g. one song.']],
      spot: { q: 'In daily_streams, what does <b>one row</b> represent?', show: SC_SONGS, o: ['one song on one day', 'all days of one song', 'every song', 'one column of streams'], why: 'Each row is one record: here, one song\u2019s streams on one day.' } }] } },
  'sql1-t2': { t1: { def: 'A primary key is {a column or set of columns} {that uniquely identifies each row}; {it can never be NULL}.', ph: [
    { a: ['one or more columns', 'a column or a group of columns'], d: [['a single row', 'A key is made of columns; rows are what it identifies.'], ['exactly one column', 'It can be several columns together (a composite key), e.g. (chart_date, track_id).'], ['a separate table', 'The key is columns inside the table itself.']],
      spot: { q: 'chart_entries has one row per song per day, identified by (chart_date, song_id). What is (chart_date, song_id)?', o: ['a set of columns used as the primary key', 'two separate primary keys', 'one row', 'a foreign key'], why: 'Two columns together can form one primary key (a composite key).' } },
    { a: ['that identifies each row uniquely', 'whose value is unique for each row'], d: [['that uniquely identifies one row', 'It identifies EACH row: every row gets its own unique value, not just one row.'], ['that uniquely identifies each column', 'A key picks out rows, not columns.'], ['that sorts each row', 'Keys identify rows; sorting is ORDER BY.']],
      spot: { q: 'Which column could be the primary key of songs?', show: SC_SNG, o: ['song_id', 'artist_id (3 appears twice)', 'title', 'the whole table'], why: 'song_id is different on every row. artist_id repeats, so it cannot identify each row.' } },
    { a: ['it is never NULL', 'it cannot be NULL'], d: [['it can sometimes be NULL', 'A missing key means a row you cannot identify, so standard SQL never allows NULL in a primary key.'], ['it can never be zero', '0 is a real value. The rule is about NULL (missing).'], ['it can never repeat in other tables', 'Repeating in other tables is fine (that is a foreign key). The rule here is: never NULL.']] }] } },
  'sql1-t3': { t1: { def: 'A foreign key is {a column that points to a key (usually the primary key)} {of another table (or, less often, of the same table)}.', ph: [
    { a: ['a column that references a key, usually the primary key', 'a column holding the values of a key, usually the primary key'], d: [['a column that points to any column', 'It must point to a key: the other table\u2019s primary key, or a column declared UNIQUE. That is what makes each value match exactly one row there.'], ['a row that points to the primary key', 'A foreign key is a column: each row has its own value in it (or NULL when the row has no link).'], ['a column that replaces the primary key', 'It replaces nothing; it refers to a key elsewhere.']],
      spot: { q: 'Which column is the <b>foreign key</b>?', show: '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>', o: ['songs.artist_id', 'songs.song_id', 'artists.artist_id', 'songs.title'], why: 'songs.artist_id holds values of artists\u2019 primary key. artists.artist_id is the primary key it points to.' } },
    { a: ['in another table (or, less often, the same table)', 'of a different table, or sometimes its own table'], d: [['of the same column', 'It links to a key column, usually in another table. (A table can point at itself, for example employees.manager_id, but never a column at itself.)'], ['of every table', 'It points to one specific table.'], ['of another database', 'Usually another table in the same database.']],
      spot: { q: 'A song has artist_id = 3. Where do you look to find who that is?', show: '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>', o: ['the artists row whose artist_id is 3', 'the songs row whose song_id is 3', 'the 3rd row of songs', 'nowhere: 3 is just a number'], why: 'The foreign key value is looked up in the other table\u2019s primary key: artist 3 is Rema.' } }] } },
  'sql1-t5': { t1: { def: 'A schema is {the structure of a database}: {its tables, columns and data types}.', ph: [
    { a: ['the design of a database', 'the layout of a database'], d: [['the data in a database', 'The schema is the shape (tables, columns, types), not the rows of data.'], ['the speed of a database', 'Speed is performance, not structure.'], ['a copy of a database', 'A copy is a backup.']],
      spot: { q: 'Which of these is part of the <b>schema</b>?', o: ['the daily_streams table has an INTEGER column streams', 'song 1 had 900 streams on 10-17', 'there are 3 rows', 'Rema sang Calm Down'], why: 'Tables, columns and types are structure; the rest are data.' } },
    { a: ['tables, columns and data types', 'its tables, columns and types'], d: [['its rows and values', 'Rows and values are the data; the schema describes their structure.'], ['its tables only', 'Columns and data types are part of the structure too.'], ['its queries and results', 'Queries read data; they are not the structure.']],
      spot: { q: 'Someone changes streams from TEXT to INTEGER. What changed?', o: ['the schema (a data type)', 'only the data', 'nothing', 'a query result'], why: 'Data types are part of the schema.' } }] } },
  'sql2-t1': { t1: { def: 'A predicate is {a condition that is TRUE, FALSE or UNKNOWN} {for each row}; {WHERE keeps only the rows where it is TRUE}.', ph: [
    { a: ['a condition that evaluates to TRUE, FALSE or UNKNOWN', 'a test that is TRUE, FALSE or UNKNOWN'], d: [['a condition that is TRUE or FALSE', 'SQL has a third result, UNKNOWN, when NULL is involved.'], ['a value that is TRUE, FALSE or UNKNOWN', 'A predicate is a test like streams > 800, not a stored value.'], ['a column that is TRUE, FALSE or UNKNOWN', 'The predicate is the test, not a column.']],
      spot: { q: 'Tap the <b>predicate</b>.', inline: true, tap: [['SELECT ', null], ['song_id', 0], [' FROM ', null], ['daily_streams', 0], [' WHERE ', null], ['streams > 800', 1], [';', null]], why: 'streams > 800 is the condition WHERE checks.' } },
    { a: ['for every row', 'checked on each row'], d: [['for one row', 'WHERE checks each row; "one row" would mean only a single row is checked.'], ['for each column', 'The condition is checked row by row, not column by column.'], ['for the whole table at once', 'It gives one answer per row, not one answer for the table.']],
      spot: { q: '<code>WHERE streams &gt; 800</code> on daily_streams. How many times is the condition checked?', show: SC_SONGS, o: ['3, once per row', '1, once for the table', '2, once per kept row', '9, once per value'], why: 'The predicate is evaluated for each row; rows where it is TRUE are kept.' } },
    { a: ['WHERE keeps the rows where it is TRUE', 'WHERE returns only rows where it is TRUE'], d: [['WHERE keeps the rows where it is not FALSE', 'UNKNOWN rows are dropped too: only TRUE survives.'], ['WHERE keeps all rows and marks the TRUE ones', 'WHERE removes rows; it does not mark them.'], ['WHERE keeps only the rows where it is FALSE', 'Kept rows are the TRUE ones.']],
      spot: { q: "<code>WHERE genre = 'Afrobeats'</code>. Which rows are kept?", show: SC_GENRE, o: ['Last Last and Calm Down', 'all three songs', 'only Free Mind', 'none'], why: 'Free Mind has NULL, so the test is UNKNOWN for it, and only TRUE rows are kept.' } }] } },
  'sql2-t2': { t1: { def: 'NULL is {a marker for a missing or unknown value}; {it is not zero and not an empty string}.', ph: [
    { a: ['a marker meaning a value is missing or unknown', 'a marker for a missing value'], d: [['a value of zero', 'NULL is not 0. Zero is a real, known number.'], ['a marker for a deleted row', 'A NULL is one missing value in a row, not a deleted row.'], ['a marker for a wrong value', 'Wrong data is still a value; NULL means there is no value.']],
      spot: { q: 'Which cell is <b>NULL</b>?', show: SC_GENRE, o: ['Free Mind\u2019s genre', 'Last Last\u2019s genre', 'the genre column', 'Calm Down\u2019s title'], why: 'Free Mind\u2019s genre is missing (unknown), shown as NULL.' } },
    { a: ['not zero and not an empty string', 'it is neither 0 nor an empty string'], d: [['it is zero or an empty string', 'The classic mistake: NULL is neither.'], ['it is not zero but it is an empty string', "An empty string '' is a known (empty) value; NULL is unknown."], ['it is not missing and not unknown', 'Missing or unknown is exactly what NULL means.']] }] } },
  'sql2-t3': { t1: { def: 'In three-valued logic {conditions can be TRUE, FALSE or UNKNOWN}; {any comparison with NULL gives UNKNOWN}, {so you test for NULL with IS NULL}.', ph: [
    { a: ['a condition can be TRUE, FALSE or UNKNOWN', 'conditions are TRUE, FALSE or UNKNOWN'], d: [['conditions can be TRUE or FALSE', 'The third value, UNKNOWN, is the whole point.'], ['conditions can be TRUE, FALSE or NULL', 'The logic value is called UNKNOWN; NULL is the missing data that causes it.'], ['values can be TRUE, FALSE or UNKNOWN', 'It is about conditions (tests), not stored values.']],
      spot: { q: "For Free Mind (genre NULL), what is <code>genre = 'Afrobeats'</code>?", show: SC_GENRE, o: ['UNKNOWN', 'FALSE', 'TRUE', 'an error'], why: 'Comparing with a missing value cannot be decided: UNKNOWN.' } },
    { a: ['any comparison with NULL yields UNKNOWN', 'comparing anything with NULL gives UNKNOWN'], d: [['any comparison with NULL gives FALSE', 'It is UNKNOWN, not FALSE. NOT FALSE is TRUE, but NOT UNKNOWN stays UNKNOWN.'], ['some comparisons with NULL give UNKNOWN', 'ANY comparison: =, <>, >, even NULL = NULL.'], ['any comparison with zero gives UNKNOWN', 'Zero is a normal value; the trouble is NULL.']],
      spot: { q: 'What does <code>NULL = NULL</code> return?', o: ['UNKNOWN', 'TRUE', 'FALSE', 'an error'], why: 'Two unknowns cannot be known to be equal: UNKNOWN.' } },
    { a: ['you test for NULL with IS NULL', 'so you check for NULL using IS NULL'], d: [['so you test for NULL with = NULL', '= NULL is a comparison, so it is always UNKNOWN and matches nothing.'], ['so you test for NULL with = 0', 'NULL is not 0; IS NULL is the test.'], ['so you test for NULL with LIKE NULL', 'LIKE is a comparison too, so UNKNOWN.']] }] } },
  'sql3-t1': { t1: { def: 'ORDER BY {sorts the result rows} {by one or more expressions}.', ph: [
    { a: ['sorts the rows of the result', 'orders the result rows'], d: [['sorts the table rows', 'ORDER BY never changes the stored table; it orders the rows the query returns.'], ['filters the result rows', 'It keeps every row; filtering is WHERE.'], ['groups the result rows', 'Grouping is GROUP BY; ORDER BY only changes the order.']],
      spot: { q: 'This query has ORDER BY streams DESC. Tap what it sorts.', tap: [[LAB('Table daily_streams', SC_SONGS), 0], [QY(SC_Q), 0], [LAB('Output', SC_RES), 1]], why: 'It sorts the result rows (the output). The daily_streams table keeps its rows as they are.' } },
    { a: ['by one or more columns or expressions', 'by one or more columns'], d: [['by one expression', '"One or more": ORDER BY artist, streams DESC sorts by two.'], ['on one or more expressions', '"on" belongs to JOIN … ON. ORDER BY sorts BY something.'], ['by one or more tables', 'You sort by values (columns or expressions), not by tables.']],
      spot: { q: 'How many sort expressions are in this ORDER BY?', show: QY('SELECT song_id FROM daily_streams\nORDER BY chart_date, streams * 2 DESC;'), o: ['2: chart_date, then streams * 2', '1: chart_date', '3', '0'], why: 'Two expressions, separated by a comma. The second only breaks ties of the first.' } }] },
    t3: 'ORDER BY {sorts the final result rows by one or more expressions}, {each ascending by default or DESC}, {with NULLs placed first or last depending on the database}; {without it no row order is guaranteed}.' },
  'sql3-t2': { t1: { def: 'LIMIT {returns only the first N rows} {of the result}.', ph: [
    { a: ['keeps only the first N rows', 'returns just the first N rows'], d: [['returns only the last N rows', 'LIMIT keeps the first N. For the "last" ones, reverse the ORDER BY.'], ['returns N random rows', 'Without ORDER BY the first N are arbitrary, but LIMIT still means "the first N".'], ['returns all rows except N', 'It keeps N; it does not remove N.']],
      spot: { q: 'What does this return?', show: SC_SONGS + QY('SELECT song_id FROM daily_streams\nORDER BY streams DESC\nLIMIT 1;'), o: ['2', '1', '3', 'all three song IDs'], why: 'Sorted by streams, highest first, the first row is song 2 (1200 streams). LIMIT 1 keeps only that row.' } },
    { a: ['of the query result', 'of the result rows'], d: [['of the table', 'LIMIT trims the result after sorting; the table is untouched.'], ['of each group', 'LIMIT applies once to the whole result.'], ['of each column', 'LIMIT counts rows.']],
      spot: { q: 'After <code>SELECT * FROM daily_streams LIMIT 2</code>, how many rows does the daily_streams table have?', o: ['still 3', '2', '1', '0'], why: 'LIMIT only trims the result. The stored table keeps its 3 rows.' } }] } },
  'sql3-t3': { t1: { def: 'DISTINCT {removes duplicate rows} {from the result}.', ph: [
    { a: ['drops duplicate rows', 'removes repeated rows'], d: [['removes duplicate columns', 'It compares whole rows of the result, not columns.'], ['removes NULL rows', 'It targets duplicates; one copy of each row stays, NULLs included.'], ['counts duplicate rows', 'Counting is COUNT; DISTINCT removes.']],
      spot: { q: '<code>SELECT DISTINCT artist FROM chart;</code> How many rows?', show: SC_CHART, o: ['2', '3', '1', '4'], why: 'The artist column reads Rema, Rema, Tems. DISTINCT removes the repeated Rema, leaving 2 rows: Rema and Tems.' } },
    { a: ['from the query result', 'from the result rows'], d: [['from the table', 'Only the result is de-duplicated; the table keeps all rows.'], ['from each column separately', 'It removes rows where ALL selected columns repeat together.'], ['from the database', 'Nothing is deleted from storage.']],
      spot: { q: '<code>SELECT DISTINCT artist, title FROM chart;</code> How many rows?', show: SC_CHART, o: ['2', '3', '1', '4'], why: 'The pair (Rema, Calm Down) appears twice, so DISTINCT keeps one copy. Add the pair (Tems, Free Mind) and the result has 2 rows.' } }] } },
  'sql3-t4': { t1: { def: 'Logical query order is {the order in which SQL clauses are logically evaluated}: {FROM, WHERE, GROUP BY, HAVING}, {then SELECT, ORDER BY, LIMIT}.', ph: [
    { a: ['the order SQL clauses are logically evaluated', 'the conceptual order in which clauses are evaluated'], d: [['the order you write the clauses', 'You write SELECT first, but it is evaluated after FROM, WHERE, GROUP BY and HAVING.'], ['the order of rows in the result', 'That is ORDER BY.'], ['the order tables are created', 'That is DDL.']] },
    { ord: true, a: [], d: [['WHERE, FROM, GROUP BY, HAVING', 'FROM comes first: rows must be read before they can be filtered.'], ['FROM, GROUP BY, WHERE, HAVING', 'WHERE filters rows before grouping; HAVING filters groups after.'], ['FROM, HAVING, GROUP BY, WHERE', 'HAVING needs groups, so it comes after GROUP BY.']],
      spot: { q: 'Why can WHERE not use SUM(streams)?', o: ['WHERE runs before GROUP BY, so no groups or sums exist yet', 'SUM only works in ORDER BY', 'WHERE runs after SELECT', 'SUM needs a JOIN'], why: 'The query is logically evaluated as FROM, then WHERE, then GROUP BY. Sums exist only after grouping, so WHERE cannot see them; filter them with HAVING.' } },
    { ord: true, a: ['then SELECT, then ORDER BY, then LIMIT'], d: [['then ORDER BY, SELECT, LIMIT', 'SELECT comes before ORDER BY; that is why ORDER BY can use a SELECT alias.'], ['then LIMIT, SELECT, ORDER BY', 'LIMIT is last: it keeps the first N rows after sorting.'], ['then SELECT, LIMIT, ORDER BY', 'Sorting must happen before you can take the first N.']],
      spot: { q: 'Why can ORDER BY use the alias <code>doubled</code> from SELECT, but WHERE cannot?', show: QY(SC_Q), o: ['ORDER BY is evaluated after SELECT; WHERE is evaluated before it', 'ORDER BY ignores aliases', 'WHERE runs last', 'aliases only work in LIMIT'], why: 'WHERE is logically evaluated before SELECT, when the alias does not exist yet. SELECT creates the alias, and ORDER BY comes after SELECT, so it can use it.' } }] } },
  'sql4-t1': { t1: { def: 'An aggregate function {takes many rows} {and returns one value}, {like COUNT, SUM or AVG}.', ph: [
    { a: ['reads many rows', 'works over many rows'], d: [['takes one row', 'Aggregates combine many rows. A normal function like UPPER works on one row at a time.'], ['takes many tables', 'It combines rows, usually from one result.'], ['takes many columns', 'It combines the values of many ROWS (one column usually).']],
      spot: { q: 'Which is an <b>aggregate</b> function call?', o: ['SUM(streams)', 'UPPER(title)', 'streams * 2', 'ROUND(streams, 0)'], why: 'SUM reads many rows. UPPER and ROUND work on one value per row.' } },
    { a: ['and returns a single value', 'and gives back one value'], d: [['and returns one value per row', 'That is a normal (scalar) function. An aggregate collapses many rows into one value.'], ['and returns many values', 'Many rows in, one value out.'], ['and returns the first value', 'It summarises all of them (count, sum, average…).']],
      spot: { q: '<code>SELECT SUM(streams) FROM daily_streams;</code> returns…', show: SC_SONGS, o: ['one row: 2800', 'three rows', '2800 on each of three rows', '900'], why: '900 + 1200 + 700 = 2800, one value.' } },
    { a: ['such as COUNT, SUM and AVG', 'like COUNT, SUM, AVG, MIN or MAX'], d: [['like UPPER, LOWER or LENGTH', 'Those work on one value per row (scalar functions).'], ['like WHERE, HAVING or GROUP BY', 'Those are clauses, not functions.'], ['like JOIN, UNION or CASE', 'None of these is an aggregate.']] }] } },
  'sql4-t2': { t1: { def: 'GROUP BY {puts rows that share the same values into groups}, {then aggregates are computed per group}.', ph: [
    { a: ['groups rows that have the same values', 'splits rows into groups with the same values'], d: [['puts columns that share the same values into groups', 'Rows are grouped, using the values in the listed columns.'], ['sorts rows that share the same values', 'Sorting is ORDER BY; GROUP BY collapses each group to one row.'], ['puts rows with different values into one group', 'Each group holds rows with the SAME values.']],
      spot: { q: '<code>GROUP BY artist</code> makes how many groups?', show: SC_CHART, o: ['2', '3', '1', '0'], why: 'Rema (2 rows) and Tems (1 row).' } },
    { a: ['then aggregates are calculated for each group', 'then each group gets its own aggregate'], d: [['then aggregates are computed for the whole table', 'With GROUP BY, COUNT/SUM run once per group, not once overall.'], ['then aggregates are computed per row', 'Per row would mean no grouping at all.'], ['then rows are deleted per group', 'Nothing is deleted; each group becomes one result row.']],
      spot: { q: '<code>SELECT artist, COUNT(*) FROM chart GROUP BY artist;</code>', show: SC_CHART, o: ['Rema 2, Tems 1', 'Rema 1, Tems 1', 'one row: 3', 'Rema 2'], why: 'COUNT(*) is computed per group.' } }] } },
  'sql4-t3': { t1: { def: 'HAVING {filters groups after aggregation}, {while WHERE filters rows before grouping}.', ph: [
    { a: ['filters groups after grouping', 'keeps only some groups after aggregation'], d: [['filters rows after aggregation', 'HAVING works on groups (and their totals), not single rows.'], ['filters groups before aggregation', 'Before aggregation there are no totals to test; HAVING comes after.'], ['sorts groups after aggregation', 'Sorting is ORDER BY.']],
      spot: { q: 'Keep only artists with more than 1 chart row. Which clause?', show: SC_CHART, o: ['HAVING COUNT(*) > 1', 'WHERE COUNT(*) > 1', 'ORDER BY COUNT(*) > 1', 'LIMIT 1'], why: 'The test uses an aggregate, so it must run after grouping: HAVING.' } },
    { a: ['WHERE filters rows before grouping', 'whereas WHERE filters rows before grouping'], d: [['while WHERE filters rows after grouping', 'WHERE runs first, on single rows, before any group exists.'], ['while WHERE filters groups before grouping', 'WHERE sees individual rows, not groups.'], ['while WHERE sorts rows before grouping', 'WHERE filters; ORDER BY sorts.']],
      spot: { q: 'Count only chart rows from 10-17. Which clause does the filtering?', show: SC_CHART, o: ["WHERE chart_date = '10-17'", "HAVING chart_date = '10-17'", "ORDER BY chart_date = '10-17'", 'GROUP BY chart_date'], why: 'Filtering single rows before counting is WHERE\u2019s job.' } }] } },
  'sql4-t4': { t1: { def: 'Grain is {what one row represents} {in a table or result}, {for example one song on one chart day}.', ph: [
    { a: ['what a single row represents', 'what each row stands for'], d: [['what one column represents', 'Grain is about rows: the level of detail of each row.'], ['how many rows there are', 'Grain is the meaning of a row, not the row count.'], ['what the whole table represents', 'It is the unit of ONE row.']] },
    { a: ['of a table or result', 'in a table or query result'], d: [['in a database', 'Grain belongs to one table or result; different tables have different grains.'], ['in a column', 'Rows have grain; columns have data types.']],
      spot: { q: '<code>SELECT artist, SUM(streams) FROM chart GROUP BY artist;</code> What is the grain of the result?', show: SC_CHART, o: ['one row per artist', 'one row per song per day', 'one row per song', 'one row in total'], why: 'GROUP BY artist changes the grain to one row per artist.' } },
    { a: ['e.g. one song on one chart day', 'such as one song on one day'], d: [['for example all songs on one chart day', 'One row is ONE song on one day, not all songs.'], ['for example one song on every chart day', 'That would be one row per song, a different grain.']],
      spot: { q: 'What is the grain of this table?', show: SC_CHART, o: ['one song on one chart day', 'one artist', 'one chart day', 'one song'], why: 'Calm Down appears once per day: one row = one song on one day.' } }] },
    t3: 'Grain is {the level of detail a table or result is stored at}, {defined by the set of columns that uniquely identifies a row}; {joins and aggregations change it, so you state it before and after each step}.' },
  'sql4-t5': { t1: { def: '{COUNT(*) counts all rows}; {COUNT(column) counts only rows where that column is not NULL}.', ph: [
    { a: ['COUNT(*) counts every row'], d: [['COUNT(*) counts all non-NULL rows', 'COUNT(*) counts rows, even rows full of NULLs.'], ['COUNT(*) counts all columns', 'It counts rows.'], ['COUNT(*) counts distinct rows', 'Duplicates are counted too.']],
      spot: { q: '<code>SELECT COUNT(*) FROM songs;</code>', show: SC_GENRE, o: ['3', '2', '1', '0'], why: 'Every row counts, including Free Mind with a NULL genre.' } },
    { a: ['COUNT(column) counts only the non-NULL values', 'COUNT(column) skips rows where it is NULL'], d: [['COUNT(column) counts all rows', 'It skips NULLs in that column.'], ['COUNT(column) counts only rows where that column is NULL', 'The opposite: it counts the NON-NULL ones.'], ['COUNT(column) counts only distinct values', 'That is COUNT(DISTINCT column).']],
      spot: { q: '<code>SELECT COUNT(genre) FROM songs;</code>', show: SC_GENRE, o: ['2', '3', '1', '0'], why: 'Free Mind\u2019s genre is NULL, so COUNT(genre) skips it.' } }] } },
  'sql5-t1': { t1: { def: 'A JOIN {combines rows from two tables} {by matching values in related columns}.', ph: [
    { a: ['puts together rows from two tables', 'combines rows of two tables'], d: [['combines columns from one table', 'A JOIN brings two tables together side by side.'], ['stacks rows from two tables', 'Stacking rows is UNION; JOIN puts matching rows side by side.'], ['combines two databases', 'It works on tables (or results).']],
      spot: { q: 'songs JOIN artists: each result row contains…', o: ['columns from one songs row and its matching artists row', 'either a song or an artist', 'only songs columns', 'every song paired with every artist'], why: 'A join row is the matched pair, side by side.' } },
    { a: ['by matching values in shared columns', 'by matching related column values'], d: [['by matching row numbers', 'Rows are matched by values (e.g. artist_id), not by position.'], ['by matching column names', 'It matches VALUES (artist_id = 3), not just column names.'], ['by matching values in every column', 'Only the related columns (keys) need to match.']],
      spot: { q: 'Join on <code>songs.artist_id = artists.artist_id</code>. "Charm" has artist_id 3. Which artist does it join to?', show: '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>', o: ['Rema (artist_id 3)', 'the 3rd row of songs', 'every artist', 'none'], why: 'Rows are matched by equal values in the related columns.' } }] } },
  'sql5-t2': { t1: { def: 'An INNER JOIN {returns only rows that have a match} {in both tables}.', ph: [
    { a: ['keeps only rows that have a match', 'returns only matching rows'], d: [['returns all rows', 'Returning all rows of one side is LEFT JOIN; INNER keeps only matches.'], ['returns only rows that have no match', 'That is an anti-join.'], ['returns only the first match', 'It returns every matching pair.']],
      spot: { q: 'artists INNER JOIN songs. Tems has no songs. Is Tems in the result?', show: '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>', o: ['No', 'Yes, with a NULL title', 'Yes, twice', 'Only with ORDER BY'], why: 'No match, so INNER JOIN drops her.' } },
    { a: ['on both sides', 'in both of the tables'], d: [['in either table', 'A match must exist on BOTH sides.'], ['in the left table', 'Both, not just the left.']] }] } },
  'sql5-t3': { t1: { def: 'A LEFT JOIN {keeps all rows from the left table}, {adds matching rows from the right}, {and fills NULL where there is no match}.', ph: [
    { a: ['returns all rows from the left table', 'keeps every row from the left table'], d: [['keeps only matching rows from the left table', 'Keeping only matches is INNER JOIN; LEFT keeps ALL left rows.'], ['keeps all rows from the right table', 'LEFT means the left (first) table is kept in full.'], ['keeps all rows from both tables', 'That is a FULL OUTER JOIN.']] },
    { a: ['plus matching rows from the right table', 'adds the matching rows from the right table'], d: [['adds all rows from the right', 'Only the right rows that match are added.'], ['adds matching rows from the left', 'The left is already fully kept; matches come from the right.']],
      spot: { q: 'artists LEFT JOIN songs. Rema has 2 songs. How many result rows for Rema?', show: '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>', o: ['2', '1', '0', '3'], why: 'One row per matching song.' } },
    { a: ['with NULL where there is no match', 'and the right-side columns are NULL where there is no match'], d: [['and fills 0 where there is no match', 'Missing values are NULL, not 0.'], ['and drops rows where there is no match', 'Dropping unmatched rows is what INNER JOIN does.'], ['and fills NULL where there is a match', 'Matched rows get real values; NULL only fills the gaps.']] }] },
    t3: 'A LEFT JOIN {preserves every row of the left input}, {attaches each matching right row (possibly several, which multiplies left rows)}, {and pads unmatched rows with NULLs}, {so filters on right columns belong in ON, not WHERE, if you want to keep them}.' },
  'sql8-t1': { t1: { def: 'A window function {computes a value across related rows} {while keeping every row in the result}.', ph: [
    { a: ['calculates a value across a set of related rows', 'computes a value over related rows'], d: [['computes a value from one row only', 'A window looks across a set of related rows, e.g. all rows of the same song.'], ['computes a value across unrelated tables', 'It works over rows of the same result.'], ['deletes values across related rows', 'It computes; it never deletes.']],
      spot: { q: 'Which expression is a <b>window function</b>?', o: ['SUM(streams) OVER (PARTITION BY artist)', 'SUM(streams)', 'UPPER(title)', 'streams * 2'], why: 'OVER(…) makes it a window function: the sum runs across the related rows.' } },
    { a: ['keeping every row in the result', 'without collapsing the rows'], d: [['while keeping one row per group', 'One row per group is GROUP BY; a window keeps every row.'], ['while keeping only the first row', 'All rows stay.'], ['while removing duplicate rows', 'No rows are removed.']] }] },
    t3: 'A window function {is evaluated over a window of rows defined by OVER(PARTITION BY … ORDER BY … frame)}, {returns one value per input row}, {and runs after WHERE, GROUP BY and HAVING}.' },
  'sql8-t2': { t1: { def: 'PARTITION BY {splits rows into separate groups for a window function} {without collapsing the rows}.', ph: [
    { a: ['divides rows into groups for a window function', 'splits rows into independent groups for a window function'], d: [['splits columns into groups for a window function', 'It groups rows.'], ['sorts rows for a window function', 'Sorting inside the window is ORDER BY in OVER().'], ['splits tables for a window function', 'It splits the rows of one result.']],
      spot: { q: 'In <code>LAG(position) OVER (PARTITION BY song_id ORDER BY chart_date)</code>, LAG looks back only within…', o: ['the same song\u2019s rows', 'the whole table', 'the previous column', 'another table'], why: 'Each song is its own partition.' } },
    { a: ['while keeping every row', 'without merging the rows'], d: [['by collapsing the rows', 'Collapsing is GROUP BY. PARTITION BY keeps every row.'], ['without keeping the rows', 'All rows are kept.']] }] } },
  'etl1-t1': { t1: { def: 'Extract is {reading data out of a source system}, {such as an API, database or file}.', ph: [
    { a: ['pulling data from a source system', 'reading data from a source'], d: [['writing data into a source system', 'Writing into the target is Load; Extract reads from the source.'], ['cleaning data in a source system', 'Cleaning is Transform.'], ['deleting data from a source system', 'Extract should not change the source at all.']],
      spot: { q: '<code>requests.get(chart_url)</code> in extract.py is which step?', o: ['Extract', 'Transform', 'Load', 'a test'], why: 'It reads data out of the source (the API).' } },
    { a: ['like an API, a database or a file'], d: [['such as a dashboard or report', 'Those consume data at the end; they are not sources.'], ['such as the warehouse table', 'The warehouse is the target.']] }] } },
  'etl1-t2': { t1: { def: 'Transform is {cleaning and reshaping data} {so it fits the target model}.', ph: [
    { a: ['cleaning, reshaping and validating data', 'cleaning and restructuring data'], d: [['copying data unchanged', 'Copying unchanged is what the raw layer does; Transform changes the shape.'], ['reading data from the API', 'That is Extract.'], ['writing data to the warehouse', 'That is Load.']],
      spot: { q: 'Turning nested JSON into flat rows with one value per column is…', o: ['Transform', 'Extract', 'Load', 'Backfill'], why: 'Reshaping data to fit the target is Transform.' } },
    { a: ['so it fits the target table', 'so it matches the target model'], d: [['so it fits the source system', 'It is shaped for the target, where it will be used.'], ['so it downloads faster', 'The goal is fitting the target model.']] }] } },
  'etl1-t3': { t1: { def: 'Load is {writing the prepared data} {into the target system}, {such as a warehouse table}.', ph: [
    { a: ['writing the transformed data', 'saving the prepared data'], d: [['reading the prepared data', 'Load writes.'], ['writing the raw data', 'In ETL, Load writes the prepared (transformed) data.']] },
    { a: ['to the target system', 'into the destination system'], d: [['into the source system', 'The source is where data came from; Load writes to the target.']],
      spot: { q: 'load.py inserts rows into chart_entries in DuckDB. chart_entries is…', o: ['the target', 'the source', 'the raw layer', 'the API'], why: 'Data is loaded into the target.' } },
    { a: ['like a data warehouse table', 'such as a table in a warehouse'], d: [['such as an API', 'An API is usually a source.']] }] } },
  'etl2-t1': { t1: { def: 'An operation is idempotent when {running it once or many times} {gives the same end result}.', ph: [
    { a: ['running it one time or many times', 'running it once or several times'], d: [['running it once', 'The point is reruns: once OR many times.'], ['running it many times faster', 'Speed is not the point.'], ['running it once a day', 'The schedule is unrelated.']],
      spot: { q: 'Monday\u2019s load runs at 07:17 and again by hand at 09:00. If the load is idempotent, how many copies of Monday\u2019s rows exist?', o: ['one copy', 'two copies', 'none', 'it depends on luck'], why: 'Once or many times, same end result: one copy.' } },
    { a: ['leaves the same end result', 'produces the same final result'], d: [['gives the same output at each step', 'It is about the END result (the final table), not every intermediate step.'], ['gives a different end result', 'A different result on rerun means NOT idempotent.'], ['gives the same speed', 'Not about speed.']] }] },
    t3: 'Idempotency {means repeated execution with the same input converges to the same state}; {pipelines get it from deterministic keys and overwrite, upsert or delete-then-insert loads}, {which makes retries and backfills safe}.' },
  'etl2-t2': { t1: { def: 'An upsert {updates a row if its key already exists} {and inserts it otherwise}.', ph: [
    { a: ['updates the row when its key exists', 'updates a row if the key is already there'], d: [['inserts a row if its key already exists', 'Inserting an existing key would duplicate it; upsert UPDATES then.'], ['deletes a row if its key already exists', 'Upsert never deletes.'], ['updates a row if its value already exists', 'It matches on the KEY, not any value.']],
      spot: { q: 'The table has song_id 7 with streams 500. Upsert (7, 650). Result?', o: ['one row for 7 with 650', 'two rows for 7', 'one row with 500', 'an error'], why: 'The key exists, so the row is updated.' } },
    { a: ['and inserts it if the key is new', 'otherwise it inserts a new row'], d: [['and ignores it otherwise', 'New keys are inserted, not ignored.'], ['and updates it otherwise', '"Otherwise" means the key is new, so it inserts.']],
      spot: { q: 'Upsert (9, 300). Key 9 does not exist yet. Result?', o: ['a new row (9, 300) is inserted', 'nothing happens', 'row 7 is updated', 'an error'], why: 'No existing key, so insert.' } }] } },
  'etl2-t3': { t1: { def: 'An incremental load is {loading only new or changed data} {since the last run}.', ph: [
    { a: ['loading just the new or changed data', 'loading only data that is new or changed'], d: [['loading all data', 'Reloading everything is a full refresh.'], ['loading only new data', 'Changed rows matter too: new OR changed.'], ['loading only deleted data', 'Not about deletions.']] },
    { a: ['since the previous run', 'after the last run'], d: [['since the first run', 'That would reload everything ever loaded.'], ['since the last error', 'It is relative to the last successful run.']] }] } },
  'etl2-t4': { t1: { def: 'A watermark is {the last processed value}, {such as a timestamp}, {stored so the next run knows where to resume}.', ph: [
    { a: ['the last value processed', 'the most recent processed value'], d: [['the first processed value', 'It is the LAST value processed, so you continue after it.'], ['the last failed value', 'It records progress, not errors.']] },
    { a: ['like a timestamp or an ID', 'such as a timestamp or ID'], d: [['such as a file name', 'Usually a timestamp or ID that increases.']] },
    { a: ['saved so the next run knows where to resume', 'stored so the next run can continue from there'], d: [['stored so the next run starts from the beginning', 'The whole point is NOT starting over.'], ['stored so the previous run knows where to resume', 'It is for the NEXT run.']],
      spot: { q: 'Watermark = 2026-10-16 23:59. Which orders does the next incremental run load?', o: ['orders after 2026-10-16 23:59', 'all orders', 'orders before 2026-10-16', 'only the watermark row'], why: 'Resume after the last processed value.' } }] } },
  'etl5-t1': { t1: { def: 'A partition is {a slice of a table} {split by a column such as date}.', ph: [
    { a: ['a subset of a table', 'a part of a table'], d: [['a copy of a table', 'A partition is part of the same table, not a copy.'], ['a column of a table', 'A partition is a set of rows.'], ['a whole table', 'It is only part of it.']] },
    { a: ['divided by a column such as date', 'split by a column like date'], d: [['split by row count', 'Partitions are split by a column\u2019s value (e.g. chart_date).'], ['split on a column such as date', '"by" names the column that decides the split, as in PARTITION BY chart_date.']],
      spot: { q: 'chart_entries is partitioned by chart_date. How many partitions?', show: SC_PART, o: ['2 (10-16 and 10-17)', '3', '1', '4'], why: 'One partition per date value.' } }] },
    t3: 'A partition is {the rows that share one value of the partition key, such as a date (warehouses like BigQuery may store each one physically apart)}, {which lets jobs overwrite only that slice and lets the engine scan only that slice (partition pruning)} {and makes reruns of one day cheap and idempotent}.' }
};

/* ---------- v10: joins built up one change at a time (J1–J12), combination drills, a real task ----------
   New steps carry v10:1 and an explicit id; old questions keep their position (id = lesson.position).
   L.order lists the teaching order as [kind, index]; arrays are only ever appended to. */
const JT = {
  listeners: ILT('listeners', ['listener_id', 'name'], [[1, 'Ada'], [2, 'Tunde'], [3, 'Zainab']], 'CREATE TABLE listeners (listener_id INTEGER PRIMARY KEY, name TEXT NOT NULL);'),
  streams: ILT('streams', ['stream_id', 'listener_id', 'song_id'], [[1, 1, 14], [2, 1, 8], [3, 2, 14], [4, 2, 1]], 'CREATE TABLE streams (stream_id INTEGER PRIMARY KEY, listener_id INTEGER REFERENCES listeners(listener_id), song_id INTEGER REFERENCES songs(song_id));'),
  songs: ILT('songs', ['song_id', 'title'], [[1, 'Heaven Baby'], [8, 'Forgiveness'], [14, 'Calm Down']], 'CREATE TABLE songs (song_id INTEGER PRIMARY KEY, title TEXT NOT NULL);')
};
const JT5 = Object.assign({}, JT, { streams: ILT('streams', JT.streams.c, JT.streams.r.concat([[5, 1, 14]]), JT.streams.ddl) });
const JTO = Object.assign({}, JT, { streams: ILT('streams', JT.streams.c, JT.streams.r.concat([[5, 9, 8]]), 'CREATE TABLE streams (stream_id INTEGER PRIMARY KEY, listener_id INTEGER, song_id INTEGER);') });
const SHOP = {
  customers: ILT('customers', ['customer_id', 'name'], [[21, 'Bisi'], [22, 'Kunle'], [23, 'Ngozi']], 'CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL);'),
  orders: ILT('orders', ['order_id', 'customer_id'], [[1, 21], [2, 21], [3, 22], [4, 21], [5, 23]], 'CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id));')
};
const J_ERD = { boxes: [{ n: 'listeners', x: 6, y: 6, cols: [['listener_id', 'PK'], ['name']] }, { n: 'streams', sub: 'event', x: 214, y: 6, cols: [['stream_id', 'PK'], ['listener_id', 'FK'], ['song_id', 'FK']] }, { n: 'songs', x: 6, y: 90, cols: [['song_id', 'PK'], ['title']] }],
  links: [{ f: ['streams', 'listener_id'], t: ['listeners', 'listener_id'] }, { f: ['streams', 'song_id'], t: ['songs', 'song_id'] }], label: 'listeners, streams and songs' };
const J5R = ILT('result', ['stream_id', 'listener_id', 'song_id', 'name'], [[1, 1, 14, 'Ada'], [2, 1, 8, 'Ada'], [3, 2, 14, 'Tunde'], [4, 2, 1, 'Tunde']]);
const J9R = ILT('result', ['listener_id', 'name', 'stream_id'], [[1, 'Ada', 1], [1, 'Ada', 2], [2, 'Tunde', 3], [2, 'Tunde', 4]]);
const SHOWT = (ts, names) => '<div class="ill-ins' + (names.length === 2 ? ' two' : '') + '">' + names.map(n => illTable(ts[n], null, {})).join('') + '</div>';
const HOSP = '<div class="ill-ins two">' + illTable(ILT('appointments', ['appt_id', 'patient_id'], [[1, 7], [2, 7], [3, 8]]), null, {}) + illTable(ILT('patients', ['patient_id', 'name'], [[7, 'Musa'], [8, 'Ife'], [9, 'Kemi']]), null, {}) + '</div>';
const SCHOOL = '<div class="ill-ins two">' + illTable(ILT('students', ['student_id', 'name'], [[1, 'Amaka'], [2, 'Bayo'], [3, 'Chika']]), null, {}) + illTable(ILT('enrolments', ['student_id', 'course'], [[1, 'Maths'], [1, 'Physics'], [1, 'Art'], [2, 'Maths']]), null, {}) + '</div>';
// count chips: [[label, rows], …]
ILL_FIGS.cnt = sc => '<div class="cntf">' + sc.fp.map((x, i) => (i ? '<span class="farr">→</span>' : '') + '<span class="cntc"><b>' + x[1] + '</b> ' + x[0] + '</span>').join('') + '</div>';
// one pointer followed by hand
ILL_FIGS.ptr = sc => '<div class="ptrf"><span class="cntc">' + sc.fp[0] + '</span><span class="farr">→</span><span class="cntc">' + sc.fp[1] + '</span></div>';
function v10Seq(L, seq, tail) {
  L.order = [];
  seq.forEach(x => { if (x.s) { x.s.v10 = 1; L.order.push(['s', L.scenes.push(x.s) - 1]); } else { x.q.v10 = 1; L.order.push(['q', L.qs.push(x.q) - 1]); } });
  if (tail) L.order = L.order.concat(tail);
}
const S_ = s => ({ s }), Q_ = q => ({ q });
const mcq = (id, q, o, w, why, x) => Object.assign({ id, k: 'mc', q, o, w, why }, x || {});
const tapq = (id, q, t, ans, why, x) => Object.assign({ id, k: 'tap', q, t, ans, why }, x || {});
{
  const L = ILLUS.sql5; L.id = 'sql5'; L.tsets = { j: JT, jo: JTO, shop: SHOP };
  const legacy = L.scenes.map((_, i) => ['s', i]).concat(L.qs.map((_, i) => ['q', i]));
  const nS = L.scenes.length; // legacy scenes and questions keep their positions
  const J = { ts: 'j' };
  const tapJ = (id, q, t, ans, why) => tapq(id, q, t, ans, why, { ts: 'j', only: ['listeners', 'streams', 'songs'].filter(n => n === t || n === 'streams' || q.indexOf(n) >= 0) });
  v10Seq(L, [
    S_({ h: 'Step 1 · Three tables you already know', ts: 'j', fig: 'erd', fp: J_ERD, stack: true,
      ask: 'Which of these three tables records events, and what does one of its rows mean?',
      say: 'In <i>Entities, events &amp; relationships</i> you sorted tables into entities (things that exist on their own) and events (records that something happened). These are three of those tables, with a few rows from the app’s practice database. <b>listeners</b> has one row per listener and <b>songs</b> has one row per song. Read the rows of <b>streams</b> before you answer on the next screen.',
      ins: [{ t: 'listeners' }, { t: 'streams' }, { t: 'songs' }] }),
    Q_(mcq('sql5.j1', 'Which table records events, and what does one of its rows mean?',
      ['streams: one row means one listener played one song once', 'listeners: one row means one person who uses the app', 'songs: one row means one song in the catalogue', 'streams: one row means one listener together with all of their plays'],
      [null, 'listeners is an entity: a listener exists even if they never play anything.', 'songs is an entity: a song exists even if nobody plays it.', 'A streams row holds a single song_id, so it can describe only one play. A listener’s plays are spread over several rows.'],
      'An event table records that something happened. Each streams row is one play: who played (listener_id) and what was played (song_id).', J)),
    S_({ h: 'Step 2 · Two columns that point', ts: 'j',
      link: 'Step 1 found that one streams row is one play. A play has to say who played and what was played.',
      ask: 'In stream 1, which column says who played, and which says what was played?',
      say: '<code>streams.listener_id</code> holds the ID of a row in <code>listeners</code>, and <code>streams.song_id</code> holds the ID of a row in <code>songs</code>. A column that holds another table’s primary key is a <b>foreign key</b> (FK): its value names exactly one row of the other table. Stream 1 has listener_id 1 and song_id 14.',
      ins: [{ t: 'streams', m: ['m', '', '', ''], why: ['stream 1: listener_id 1 says who played; song_id 14 says what was played'] }] }),
    Q_({ id: 'sql5.j2', k: 'tapc', ts: 'j', only: ['streams'], q: 'In <code>streams</code>, tap the column that says <b>who</b> played the song.', t: 'streams', ans: [1],
      why: 'listener_id holds the ID of a row in listeners, so it says who played. song_id says what was played, and stream_id only numbers the play itself.' }),
    Q_(mcq('sql5.j2b', 'Stream 1 has song_id 14. What does the 14 refer to?',
      ['the row of songs whose song_id is 14 (Calm Down)', 'the 14th row of songs, counted from the top', 'the number of times the song was played', 'stream number 14'],
      [null, 'A foreign key holds an ID value, not a row position; songs has only 3 rows, and row order is not stored meaning.', 'Each stream row is one play; the count of plays comes from counting rows.', 'The stream’s own number is in stream_id (it is 1 here).'],
      'A foreign key value names the row in the other table with the same key value: song_id 14 in songs is Calm Down.', J)),
    S_({ h: 'Step 3 · Follow one pointer by hand', ts: 'j', fig: 'ptr', fp: ['streams · stream 2 · listener_id = 1', 'listeners · listener_id 1 = Ada'],
      link: 'Step 2 found that listener_id names one row of listeners. Now follow that name for one stream.',
      ask: 'Who played stream 2?',
      say: 'Stream 2 has listener_id 1. In <code>listeners</code>, the row whose listener_id is also 1 is Ada, so Ada played stream 2. Nothing was copied or calculated: you looked up one value in another table.',
      ins: [{ t: 'streams', m: ['', 'm', '', ''], why: [null, 'stream 2: listener_id = 1 is the value we follow'] }, { t: 'listeners', m: ['m', '', ''], why: ['listener_id 1 equals stream 2’s listener_id, so Ada played stream 2'] }] }),
    Q_(tapJ('sql5.j3', 'Stream 3 has listener_id 2. In <code>listeners</code>, tap the listener who played stream 3.', 'listeners', [1], 'Tunde’s listener_id is 2, the same value as stream 3’s listener_id.')),
    S_({ h: 'Step 4 · Which way does the pointer go?', ts: 'j',
      link: 'In Step 3 you started at one stream and found exactly one listener.',
      ask: 'How many listeners can one stream point to, and how many streams can point to one listener?',
      say: 'Look at the listener_id column of <code>streams</code>. Each stream row has one listener_id cell, and a cell holds one value. Different rows are allowed to hold the same value. The colours show which streams hold the same listener_id.',
      ins: [{ t: 'streams', m: ['g0', 'g0', 'g1', 'g1'] }, { t: 'listeners', m: ['g0', 'g1', ''] }], lg: { g: 'same colour = the same listener_id' } }),
    Q_(mcq('sql5.j4', 'How many listeners can one stream point to, and how many streams can point to one listener?',
      ['one listener per stream; many streams per listener', 'many listeners per stream; one stream per listener', 'exactly one each way', 'many each way'],
      [null, 'A stream has a single listener_id cell, so it can name only one listener.', 'Streams 1 and 2 both hold listener_id 1, so one listener can have many streams.', 'A cell holds one value, so a stream cannot name many listeners; many on both sides needs a linking table.'],
      'This is <b>one-to-many</b>: one listener, many streams. listeners is the <b>one side</b>: each listener appears in it once. streams is the <b>many side</b>: one listener can have many stream rows. The foreign key sits on the many side, because each stream row names one row on the one side.', J)),
    S_({ h: 'Step 5 · Every stream gets its listener, by hand', ts: 'j',
      link: 'Step 3 followed the pointer for one stream, and Step 4 showed that each stream names exactly one listener.',
      ask: 'What is the name of the listener for each of the four streams?',
      say: 'Do the Step 3 lookup once for every stream, one at a time. The next four screens each give you one stream to look up.',
      ins: [{ t: 'streams' }, { t: 'listeners' }] }),
    Q_(tapJ('sql5.j5a', 'Stream 1 has listener_id 1. Tap its listener.', 'listeners', [0], 'listener_id 1 is Ada.')),
    Q_(tapJ('sql5.j5b', 'Stream 2 has listener_id 1. Tap its listener.', 'listeners', [0], 'listener_id 1 is Ada again: one listener can have several streams.')),
    Q_(tapJ('sql5.j5c', 'Stream 3 has listener_id 2. Tap its listener.', 'listeners', [1], 'listener_id 2 is Tunde.')),
    Q_(tapJ('sql5.j5d', 'Stream 4 has listener_id 2. Tap its listener.', 'listeners', [1], 'listener_id 2 is Tunde.')),
    S_({ h: 'Step 5 · Your four answers as one table', ts: 'j',
      link: 'You looked up one listener for each of the four streams.',
      ask: 'What does a table of your answers look like?',
      say: 'Write each stream again with the name you found next to it. The result has the three stream columns plus a new <b>name</b> column. Each result row is still one stream, because you did one lookup per stream.',
      ins: [{ t: 'streams', role: 'Before: streams' }],
      out: { role: 'After: each stream with its listener’s name', c: ['stream_id', 'listener_id', 'song_id', 'name'], r: J5R.r, m: ['n', 'n', 'n', 'n'], nc: [3],
        why: ['stream 1: listener_id 1 → Ada', 'stream 2: listener_id 1 → Ada', 'stream 3: listener_id 2 → Tunde', 'stream 4: listener_id 2 → Tunde'] },
      lg: { n: '＋ name added by your lookup' } }),
    Q_(mcq('sql5.j6', '<code>streams</code> has 4 rows. How many rows does your table of answers from Step 5 have, and why?',
      ['4: one lookup per stream, and each stream finds exactly one listener', '3: one row per listener', '2: one row per listener who has streams', '12: every stream with every listener'],
      [null, 'The table was built stream by stream; listeners only supplied the names.', 'Ada and Tunde each appear twice, once per stream. Rows are not merged.', 'Each stream was paired only with the listener its listener_id names, not with all three.'],
      'Following a pointer from the many side (streams) to the one side (listeners) gives one row per stream. Ada appears twice only because she has two streams.',
      { ts: 'j', ref: false, show: illTable(J5R, null, { role: 'Your table from Step 5' }), back: 'sql5.j6b' })),
    Q_(mcq('sql5.j6b', 'A fresh example: a clinic. Each appointment names one patient. Look up the patient for each appointment by hand. How many rows does “each appointment with its patient’s name” have?',
      ['3: one per appointment', '2: Musa once and Ife once', '1: only Musa, who has two appointments', '9: every appointment with every patient'],
      [null, 'Musa has two appointments, so he appears twice; rows are not merged.', 'Every appointment gets a row, not only the patients with several.', 'Each appointment is paired only with the patient its patient_id names.'],
      'Appointment 1 → Musa, appointment 2 → Musa, appointment 3 → Ife. Three lookups give three rows. Kemi has no appointment, so no row mentions her.', { ref: false, show: HOSP })),
    S_({ h: 'Step 6 · The rule: one row per many-side row', ts: 'j', fig: 'cnt', fp: [['streams in', 4], ['rows out', 4]],
      link: 'You counted 4 streams going in and 4 rows coming out.',
      ask: 'Why does the count stay the same?',
      say: 'Each stream names exactly one listener, so each stream produces exactly one result row. When you follow a pointer from the many side (streams, where one listener can have many rows) to the one side (listeners, where each listener appears once), the result keeps <b>one row per many-side row</b>. Ada appears twice only because two streams point to her.',
      ins: [{ t: 'streams', role: 'Before: streams' }], out: { role: 'After: one row per stream', c: J5R.c, r: J5R.r, nc: [3] } }),
    S_({ h: 'Step 7 · Write the lookup as SQL', ts: 'j',
      link: 'Steps 5 and 6 did the lookup by hand: for each stream, find the listener whose listener_id is the same.',
      ask: 'How do you ask the database to do that same lookup?',
      say: '<code>FROM streams st</code> means “go through streams one row at a time”. <code>JOIN listeners l</code> means “bring in listeners”. <code>ON l.listener_id = st.listener_id</code> is the rule you used by hand: pair each stream with the listener whose ID equals the stream’s listener_id. <code>st</code> and <code>l</code> are short names (aliases) for the two tables. Run it and compare it with your table from Step 5.',
      sql: 'SELECT st.stream_id, st.listener_id, st.song_id, l.name\nFROM streams st\nJOIN listeners l\n  ON l.listener_id = st.listener_id;',
      ins: [{ t: 'streams', m: ['m', 'm', 'm', 'm'], role: 'FROM: gone through row by row', why: ['listener_id 1 matches Ada', 'listener_id 1 matches Ada', 'listener_id 2 matches Tunde', 'listener_id 2 matches Tunde'] },
        { t: 'listeners', m: ['m', 'm', 'x'], role: 'JOIN: looked up', why: ['matched by streams 1 and 2', 'matched by streams 3 and 4', 'no stream holds listener_id 3, so no result row uses Zainab'] }],
      out: { c: J5R.c, r: J5R.r, m: ['m', 'm', 'm', 'm'], nc: [3], why: ['stream 1 with Ada', 'stream 2 with Ada', 'stream 3 with Tunde', 'stream 4 with Tunde'] },
      lg: { x: '✕ no stream points here' } }),
    Q_(mcq('sql5.j7', 'Which part of the query is the rule you followed by hand in Step 3?',
      ['ON l.listener_id = st.listener_id', 'FROM streams st', 'JOIN listeners l', 'SELECT st.stream_id, l.name'],
      [null, 'FROM only says which table is gone through row by row.', 'JOIN only says which table to bring in; it does not say which rows pair up.', 'SELECT only chooses the columns to show.'],
      'ON is the matching rule: a stream pairs with the listener whose listener_id equals its own.', { ts: 'j', sql: 'SELECT st.stream_id, l.name\nFROM streams st\nJOIN listeners l\n  ON l.listener_id = st.listener_id;' })),
    Q_(mcq('sql5.j7t', 'A different place: a shop. Each order row names one customer. Which query gives each order with its customer’s name?',
      ['SELECT o.order_id, c.name FROM orders o JOIN customers c ON c.customer_id = o.customer_id;', 'SELECT o.order_id, c.name FROM orders o JOIN customers c ON c.customer_id = o.order_id;', 'SELECT o.order_id, c.name FROM orders o JOIN customers c;', 'SELECT o.order_id, c.name FROM orders o JOIN customers c ON c.name = o.customer_id;'],
      [null, 'order_id numbers the order; it is not a customer’s ID, so it would pair orders with the wrong customers (or none).', 'Without ON nothing restricts the pairs, so SQLite pairs every order with every customer.', 'A name is text and customer_id is a number, so no row would ever match.'],
      'Same pattern as streams and listeners: the order’s foreign key, customer_id, must equal the customer’s primary key.', { ts: 'shop', back: 'sql5.j7b' })),
    Q_(tapq('sql5.j7b', 'One step back, by hand: order 3 has customer_id 22. Tap that customer.', 'customers', [1], 'customer_id 22 is Kunle. ON c.customer_id = o.customer_id does exactly this lookup for every order.', { ts: 'shop' })),
    S_({ h: 'Step 8 · A second pointer: songs', ts: 'j',
      link: 'Step 7 gave each stream its listener’s name. Each stream also has a song_id, which points to songs.',
      ask: 'Which title does each stream’s song_id name?',
      say: 'Do the same kind of lookup again, this time from song_id to <code>songs</code>. Start from your table from Step 7. The next four screens each give you one stream.',
      ins: [{ tab: J5R, role: 'From Step 7' }, { t: 'songs' }] }),
    Q_(tapJ('sql5.j8a', 'Stream 1 has song_id 14. Tap its song.', 'songs', [2], 'song_id 14 is Calm Down.')),
    Q_(tapJ('sql5.j8b', 'Stream 2 has song_id 8. Tap its song.', 'songs', [1], 'song_id 8 is Forgiveness.')),
    Q_(tapJ('sql5.j8c', 'Stream 3 has song_id 14. Tap its song.', 'songs', [2], 'song_id 14 is Calm Down again: one song can be played many times.')),
    Q_(tapJ('sql5.j8d', 'Stream 4 has song_id 1. Tap its song.', 'songs', [0], 'song_id 1 is Heaven Baby.')),
    S_({ h: 'Step 8 · Two joins, one per pointer', ts: 'j',
      link: 'You found one title for each of the four streams.',
      ask: 'Who played what?',
      say: 'Each JOIN follows one pointer. The first adds the listener’s name, and the second adds the song title. Both follow pointers from the many side, so the result is still one row per stream: 4 rows.',
      sql: 'SELECT st.stream_id, l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s     ON s.song_id = st.song_id;', stack: true,
      ins: [{ t: 'streams', m: ['m', 'm', 'm', 'm'], role: 'FROM', why: ['listener 1 (Ada), song 14 (Calm Down)', 'listener 1 (Ada), song 8 (Forgiveness)', 'listener 2 (Tunde), song 14 (Calm Down)', 'listener 2 (Tunde), song 1 (Heaven Baby)'] },
        { t: 'listeners', m: ['m', 'm', 'x'], role: 'first JOIN', why: ['named by streams 1 and 2', 'named by streams 3 and 4', 'no stream names listener 3'] },
        { t: 'songs', m: ['m', 'm', 'm'], role: 'second JOIN', why: ['named by stream 4', 'named by stream 2', 'named by streams 1 and 3'] }],
      out: { c: ['stream_id', 'name', 'title'], r: [[1, 'Ada', 'Calm Down'], [2, 'Ada', 'Forgiveness'], [3, 'Tunde', 'Calm Down'], [4, 'Tunde', 'Heaven Baby']], m: ['m', 'm', 'm', 'm'], nc: [1, 2],
        why: ['stream 1: Ada played Calm Down', 'stream 2: Ada played Forgiveness', 'stream 3: Tunde played Calm Down', 'stream 4: Tunde played Heaven Baby'] },
      lg: { x: '✕ no stream points here' } }),
    Q_(mcq('sql5.j8', 'How many rows does the two-join query return?',
      ['4: one per stream', '3: one per song', '2: one per listener with streams', '36: 4 × 3 × 3'],
      [null, 'Calm Down is named by two streams, so it appears twice; songs are not merged.', 'Each listener appears once per stream they made.', 'ON keeps only the matching pairs, so tables are not multiplied.'],
      'Both joins go from the many side (streams) to a one side, so each stream stays exactly one row.', { ts: 'j', sql: 'SELECT l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s     ON s.song_id = st.song_id;' })),
    S_({ h: 'Step 9 · Start from the other side', ts: 'j', v101: 1, tf: 1,
      link: 'In Step 8 every query started FROM streams, and 4 stream rows stayed 4 result rows, because each stream points to exactly one listener. Now the query starts from listeners instead.',
      ask: 'How many streams point to Ada?',
      say: 'The first table above is <code>listeners</code> and the second is <code>streams</code>. In Step 4 you saw that they form a <b>one-to-many</b> relationship. <code>listeners</code> is the <b>one side</b> of that relationship: each listener appears in it once. <code>streams</code> is the <b>many side</b>: one listener can have many streams, because several stream rows can hold the same listener_id. To start from listeners, take one listener at a time and look down the listener_id column of streams for every row that holds that listener’s ID. Ada’s listener_id is 1, so look for the value 1.',
      ins: [{ t: 'listeners', role: 'listeners: the one side (each listener appears once)' }, { t: 'streams', role: 'streams: the many side (one listener can have many streams)' }] }),
    Q_(tapJ('sql5.j9a', 'Ada has listener_id 1. In <code>streams</code>, tap every stream with listener_id 1.', 'streams', [0, 1], 'Streams 1 and 2 both hold listener_id 1.')),
    Q_(mcq('sql5.j9n1', 'How many streams point to Ada, and what tells you?',
      ['2: streams 1 and 2 both hold listener_id 1', '1: Ada’s listener_id is 1', '2: Ada appears twice in listeners', '4: every stream in the table'],
      [null, 'The 1 is Ada’s ID, not a count. Count the stream rows that hold that ID: there are two.', 'Ada appears only once in listeners, because listeners is the one side. The two rows that point to her are in streams.', 'Streams 3 and 4 hold listener_id 2, so they point to Tunde, not Ada.'],
      'A stream points to Ada when its listener_id equals Ada’s listener_id, 1. Streams 1 and 2 do, so 2 streams point to her.', { ts: 'j', only: ['listeners', 'streams'] })),
    S_({ h: 'Step 9 · Ada needs two result rows', ts: 'j', v101: 1, tf: 1, stack: true,
      link: 'You found that two streams point to Ada: streams 1 and 2.',
      ask: 'How many result rows does Ada get when the query starts from listeners?',
      say: 'Start with the marks on the two tables above: Ada is marked 2× because streams 1 and 2 (marked ✓) hold her listener_id, 1. Now look at the After table. A result row can hold only one stream_id, just as a cell holds one value. Ada has two matching streams, so the query writes Ada once for each of them: the first row pairs Ada with stream 1, and the second pairs Ada with stream 2. A listener and one of their streams, where the stream’s listener_id equals the listener’s listener_id, is called a <b>matching pair</b>. Ada is still one row in <code>listeners</code>; she appears twice in the result because each result row is one matching pair. Only Ada’s rows are shown here, so that you can work out Tunde’s yourself next.',
      ins: [{ t: 'listeners', m: ['d', '', ''], why: ['Ada (listener_id 1) matches streams 1 and 2, so she needs two result rows'] },
        { t: 'streams', m: ['m', 'm', '', ''], why: ['listener_id 1: points to Ada', 'listener_id 1: points to Ada'] }],
      out: { role: 'After: Ada’s result rows only', c: J9R.c, r: J9R.r.slice(0, 2), m: ['d', 'd'], why: ['Ada paired with stream 1', 'Ada paired with stream 2'] },
      lg: { d: '2× Ada appears twice, once per matching stream' } }),
    Q_(tapJ('sql5.j9b', 'Tunde has listener_id 2. Tap every stream with listener_id 2.', 'streams', [2, 3], 'Streams 3 and 4 both hold listener_id 2.')),
    Q_(mcq('sql5.j9n2', 'How many result rows does Tunde get, and why?',
      ['2: one for each of his matching streams, 3 and 4', '1: Tunde is one row in listeners', '2: because Ada got 2', '4: one for every stream'],
      [null, 'Tunde is one row in listeners, but each result row is one matching pair, and he has two matching streams.', 'The answer is 2, but not because of Ada. Each listener’s count comes from their own matching streams.', 'Streams 1 and 2 point to Ada, so they do not pair with Tunde.'],
      'Streams 3 and 4 hold listener_id 2, so Tunde has two matching pairs and gets two result rows.', { ts: 'j', only: ['listeners', 'streams'] })),
    S_({ h: 'Step 9 · Zainab: no stream points to her', ts: 'j', v101: 1, tf: 1, stack: true,
      link: 'Ada and Tunde each got one result row per matching stream. Zainab is the third listener.',
      ask: 'Which streams point to Zainab?',
      say: 'Zainab’s listener_id is 3. Look down the listener_id column of <code>streams</code>: it holds 1, 1, 2 and 2. Answer the next question before reading on.',
      ins: [{ t: 'listeners' }, { t: 'streams' }] }),
    Q_(mcq('sql5.j9c', 'Zainab has listener_id 3. Which streams have listener_id 3?',
      ['none', 'stream 3', 'every stream', 'stream 1'],
      [null, 'Stream 3’s listener_id is 2 (Tunde); its stream_id happens to be 3, but stream_id only numbers the play.', 'Each stream names one listener, and none of them names 3.', 'Stream 1 has listener_id 1 (Ada).'],
      'No streams row holds listener_id 3. Zainab is a listener who has not played anything yet.', { ts: 'j', only: ['listeners', 'streams'] })),
    S_({ h: 'Step 9 · JOIN keeps only matched pairs', ts: 'j', v101: 1, tf: 1, stack: true,
      link: 'You found that no stream holds listener_id 3, so Zainab has no matching pair.',
      ask: 'Does Zainab get a result row?',
      say: 'Read the marks on <code>listeners</code> first: Ada and Tunde each have matching streams, and Zainab has none. Then read the result: it holds Ada’s two pairs and Tunde’s two pairs, and nothing for Zainab, because there is no pair to write. This is the rule of <code>JOIN</code> written on its own: it means <b>INNER JOIN</b>, and it keeps only matched pairs. A listener with no matching stream is left out of the result. Leaving her out is correct when the question is “show each listener with their streams”. Another kind of join, LEFT JOIN, keeps Zainab with empty stream columns; it comes later in this lesson.',
      sql: 'SELECT l.listener_id, l.name, st.stream_id\nFROM listeners l\nJOIN streams st\n  ON st.listener_id = l.listener_id;',
      ins: [{ t: 'listeners', m: ['m', 'm', 'x'], why: ['Ada: matched by streams 1 and 2', 'Tunde: matched by streams 3 and 4', 'Zainab: no stream holds listener_id 3, so JOIN writes no row for her'] }],
      out: { c: J9R.c, r: J9R.r, m: ['m', 'm', 'm', 'm'], why: ['pair: Ada and stream 1', 'pair: Ada and stream 2', 'pair: Tunde and stream 3', 'pair: Tunde and stream 4'] },
      lg: { x: '✕ no matching stream: no row' } }),
    Q_(mcq('sql5.j9n3', 'Why is Zainab missing from the result?',
      ['JOIN on its own (INNER JOIN) keeps only matched pairs, and no stream holds listener_id 3', 'her name is empty (NULL) in listeners', 'JOIN only keeps the first two listeners', 'her listener_id 3 clashes with stream 3’s stream_id'],
      [null, 'Her name is Zainab; the table shows it. She is dropped because nothing matches her ID.', 'JOIN does not count positions. A fourth listener with a stream would be kept.', 'ON compares st.listener_id with l.listener_id; stream_id is never compared, so it cannot clash.'],
      'A row appears only for a matching pair. Zainab has none, so INNER JOIN leaves her out. LEFT JOIN, later, keeps her.', { ts: 'j', only: ['listeners', 'streams'] })),
    Q_(mcq('sql5.j9', 'You start from 3 listeners. Ada has 2 streams, Tunde has 2 and Zainab has 0. How many rows does <code>FROM listeners l JOIN streams st ON st.listener_id = l.listener_id</code> return?',
      ['4', '3', '6', '2'],
      [null, '3 would be one row per listener, but a listener with two streams gets two rows.', '6 assumes 2 streams for each of the 3 listeners, but Zainab has none.', '2 counts the listeners who have streams, but each of their streams is a separate row.'],
      '2 + 2 + 0 = 4. Each result row is one matching pair, so a listener with two streams gets two rows and a listener with none gets no row.', { ts: 'j', only: ['listeners', 'streams'], back: 'sql5.j9back' })),
    Q_(mcq('sql5.j9back', 'One step back, with a fresh example: a school. Amaka is enrolled in 3 courses, Bayo in 1 and Chika in none. Count by hand: how many rows does joining students to enrolments give?',
      ['4', '3', '9', '2'],
      [null, '3 would be one row per student, but Amaka gets one row per course.', '9 pairs every student with three courses; only real enrolments match.', '2 counts the students with enrolments, not their enrolments.'],
      'Amaka 3 + Bayo 1 + Chika 0 = 4 rows: one per matching (student, enrolment) pair.', { ref: false, show: SCHOOL })),
    S_({ h: 'Step 9 · 3 listeners in, 4 rows out: fan-out', ts: 'j', v101: 1, tf: 1, fig: 'cnt', fp: [['listeners in', 3], ['rows out', 4]], stack: true,
      link: 'You counted 2 + 2 + 0 = 4 result rows from 3 listeners.',
      ask: 'What is this repeating called, and how is it different from Step 8?',
      say: 'Three listener rows went in and four result rows came out. When a query starts from the one side (listeners) and joins the many side (streams), each listener is repeated once for every matching stream. This repeating is called <b>fan-out</b>: one row on the one side fans out into several result rows. In Step 8 the count could not change, because each stream matches exactly one listener; starting from listeners, the count can grow (Ada and Tunde) and a row can also disappear (Zainab, because JOIN keeps only matched pairs).',
      ins: [{ t: 'listeners', role: 'In: 3 listeners' }],
      out: { role: 'Out: 4 rows', c: J9R.c, r: J9R.r, m: ['d', 'd', 'd', 'd'], why: ['Ada, first copy: paired with stream 1', 'Ada, second copy: paired with stream 2', 'Tunde, first copy: paired with stream 3', 'Tunde, second copy: paired with stream 4'] },
      lg: { d: '2× this listener appears twice' } }),
    Q_(mcq('sql5.j9n4', 'Which sentence describes fan-out?',
      ['one row on the one side is repeated once for each matching row on the many side', 'the database copies the whole table by mistake', 'every listener is paired with every stream', 'rows with no match are dropped'],
      [null, 'Nothing goes wrong: each repeated row is a real matching pair.', 'Pairing every row with every row, with no matching rule, is a different join (CROSS JOIN, Step 13).', 'That is the INNER JOIN rule that dropped Zainab. Fan-out is the repeating of Ada and Tunde.'],
      'Fan-out: a one-side row (Ada) is written once per matching many-side row (streams 1 and 2).', { ts: 'j', only: ['listeners', 'streams'] })),
    S_({ h: 'Step 9 · The whole picture', ts: 'j', v101: 1, tf: 1, fig: 'cnt', fp: [['listeners in', 3], ['rows out', 4]],
      link: 'You have now seen each piece on its own: Ada’s two rows, Tunde’s two rows, Zainab’s missing row, and the name fan-out.',
      ask: 'Can you read the whole join in one picture?',
      say: 'Read the <code>listeners</code> table first. Ada (2×) matches streams 1 and 2, Tunde (2×) matches streams 3 and 4, and Zainab (✕) matches none. The <code>streams</code> table shows each stream matching one listener. Then read the result: each of its 4 rows is one matching pair of a listener and a stream. Ada and Tunde each appear twice because of fan-out, and Zainab is missing because JOIN on its own (INNER JOIN) keeps only matched pairs.',
      sql: 'SELECT l.listener_id, l.name, st.stream_id\nFROM listeners l\nJOIN streams st\n  ON st.listener_id = l.listener_id;',
      ins: [{ t: 'listeners', m: ['d', 'd', 'x'], role: 'FROM: listeners, the one side', why: ['Ada matches streams 1 and 2, so she appears twice', 'Tunde matches streams 3 and 4, so he appears twice', 'no stream has listener_id 3, so the INNER JOIN drops Zainab'] },
        { t: 'streams', m: ['m', 'm', 'm', 'm'], role: 'JOIN: streams, the many side', why: ['listener_id 1: matches Ada', 'listener_id 1: matches Ada', 'listener_id 2: matches Tunde', 'listener_id 2: matches Tunde'] }],
      out: { c: J9R.c, r: J9R.r, m: ['d', 'd', 'd', 'd'], why: ['Ada, first copy: paired with stream 1', 'Ada, second copy: paired with stream 2', 'Tunde, first copy: paired with stream 3', 'Tunde, second copy: paired with stream 4'] },
      lg: { d: '2× this listener appears twice', x: '✕ no matching stream: dropped' } }),
    Q_(tapq('sql5.j9n5', 'A shop. Start FROM customers and JOIN orders. Bisi has customer_id 21. Tap every order that pairs with Bisi.', 'orders', [0, 1, 3], 'Orders 1, 2 and 4 hold customer_id 21, so Bisi fans out into 3 result rows.', { ts: 'shop' })),
    Q_(mcq('sql5.j9t', 'A shop has 3 customers. Bisi has 3 orders, Kunle has 1 and Ngozi has 1. How many rows does <code>FROM customers c JOIN orders o ON o.customer_id = c.customer_id</code> return?',
      ['5', '3', '9', '4'],
      [null, '3 is one row per customer, but Bisi gets one row per order.', '9 pairs every customer with every order; ON keeps only matching pairs.', 'Count every order once: 3 + 1 + 1.'],
      'One row per matching (customer, order) pair: 3 + 1 + 1 = 5. Bisi fans out into 3 rows.', { ts: 'shop' })),
    S_({ h: 'Step 10 · Does the written order change the answer?', ts: 'j', stack: false,
      link: 'Step 6 started from the many side and Step 9 from the one side, and both gave 4 rows.',
      ask: 'Do FROM streams JOIN listeners and FROM listeners JOIN streams contain different pairs?',
      say: 'Put the two results side by side. They hold the same 4 (stream, listener) pairs; only the column order differs. With JOIN on its own (INNER JOIN, which keeps only matched pairs), the written order does not change which pairs match. What changed between Steps 6 and 9 was the question you asked (“for each stream” or “for each listener”), not the result. The written order does matter for LEFT JOIN, which comes later in this lesson.',
      ins: [{ tab: ILT('FROM streams JOIN listeners', ['stream_id', 'name'], [[1, 'Ada'], [2, 'Ada'], [3, 'Tunde'], [4, 'Tunde']]), role: 'Step 6 (from streams)' }, { tab: ILT('FROM listeners JOIN streams', ['name', 'stream_id'], [['Ada', 1], ['Ada', 2], ['Tunde', 3], ['Tunde', 4]]), role: 'Step 9 (from listeners)' }] }),
    Q_(mcq('sql5.j10', 'How many rows does <code>FROM songs s JOIN streams st ON st.song_id = s.song_id</code> return?',
      ['4: one per stream; Calm Down appears twice', '3: one per song', '2: only songs played twice', '12: every song with every stream'],
      [null, 'Calm Down is named by two streams, so it gets two rows.', 'Heaven Baby and Forgiveness each have one stream, and each stream is a row.', 'ON keeps only the pairs where song_id matches.'],
      'Same pairs whichever table is written first: each stream matches one song, so there are 4 rows.', { ts: 'j', only: ['songs', 'streams'] })),
    Q_(mcq('sql5.j10h', 'A clinic report must list every appointment with its patient’s name. Every appointment names a patient who exists. How many rows should the joined result have?',
      ['the number of appointments', 'the number of patients', 'patients × appointments', 'the number of patients who have an appointment'],
      [null, 'A patient with two appointments appears twice.', 'ON keeps only the matching pairs.', 'That counts people, but the report lists appointments.'],
      'appointments is the many side; following each appointment’s patient_id gives one row per appointment.', { ref: false, show: HOSP })),
    S_({ h: 'Step 11 · When a pointer points nowhere', ts: 'jo', v101: 1,
      link: 'Step 9 showed that JOIN keeps only matched pairs, and dropped Zainab, a listener with no streams. Steps 6 to 9 also assumed that every listener_id names a real listener.',
      ask: 'What happens to a stream whose listener_id matches no listener?',
      say: 'Stream 5 holds listener_id 9, and no listener has ID 9. A foreign key value that names a row which does not exist is called an <b>orphan key</b>. JOIN keeps only matched pairs, and stream 5 has no matching listener, so the stream disappears from the result, and a count of plays after the join would be 1 too low. A <b>constraint</b> is a rule the database checks every time a row is written. A FOREIGN KEY constraint refuses any stream whose listener_id names no listener, so orphans cannot be written in the first place (SQLite checks it only after <code>PRAGMA foreign_keys = ON</code>). The LEFT JOIN lesson later shows how to find orphans that are already in a table.',
      sql: 'SELECT st.stream_id, l.name\nFROM streams st\nJOIN listeners l\n  ON l.listener_id = st.listener_id;',
      ins: [{ t: 'streams', m: ['m', 'm', 'm', 'm', 'x'], why: ['listener 1 exists (Ada)', 'listener 1 exists (Ada)', 'listener 2 exists (Tunde)', 'listener 2 exists (Tunde)', 'listener_id 9 matches no listener, so JOIN (matched pairs only) drops this stream'] }],
      out: { c: ['stream_id', 'name'], r: [[1, 'Ada'], [2, 'Ada'], [3, 'Tunde'], [4, 'Tunde']], m: ['m', 'm', 'm', 'm'], why: ['kept: matched Ada', 'kept: matched Ada', 'kept: matched Tunde', 'kept: matched Tunde'] },
      lg: { x: '✕ orphan key: dropped' } }),
    S_({ h: 'Step 12 · Join, then count', ts: 'j', v101: 1,
      link: 'In Step 9, starting from listeners gave one row per matching pair: each listener was repeated once per stream (fan-out).',
      ask: 'How many streams does each listener have?',
      say: 'Counting the repeated rows answers it. <code>GROUP BY l.listener_id, l.name</code> puts each listener’s rows into one group, and <code>COUNT(*)</code> counts the rows in each group. Group by the ID as well as the name, because two listeners could share a name.',
      sql: 'SELECT l.name, COUNT(*) AS plays\nFROM listeners l\nJOIN streams st ON st.listener_id = l.listener_id\nGROUP BY l.listener_id, l.name;',
      ins: [{ tab: J9R, m: ['g0', 'g0', 'g1', 'g1'], role: 'Before: the rows after the join (Step 9)' }],
      out: { c: ['name', 'plays'], r: [['Ada', 2], ['Tunde', 2]], m: ['g0', 'g1'], nc: [1] },
      lg: { g: 'same colour = one group (one listener)' } }),
    Q_(mcq('sql5.j11', 'Zainab is not in the Step 12 result. Why?',
      ['JOIN keeps only matched pairs, no stream points to her, so she has no row left to count', 'COUNT(*) skips names it cannot count', 'GROUP BY removes groups that have only one row', 'she has a count of 0, and SQL hides counts of 0'],
      [null, 'COUNT(*) counts rows in each group; it never looks at names. Zainab had no row to count.', 'GROUP BY keeps every group, including groups of one row.', 'She is not hidden: her row was already gone after the JOIN, before any counting happened.'],
      'Rows dropped by the join cannot be counted. Showing her with 0 plays needs a join that keeps unmatched listeners, LEFT JOIN, which comes next in this lesson.', { ts: 'j', only: ['listeners', 'streams'] })),
    S_({ h: 'Step 13 · No matching rule: every pair', ts: 'j', v101: 1,
      link: 'Every join so far used ON to keep only the pairs whose IDs match.',
      ask: 'What happens when nothing restricts the pairs?',
      say: '<code>CROSS JOIN</code> pairs every row of the first table with every row of the second: 3 listeners × 3 songs = 9 rows. This is useful on purpose, for example to build a grid of every listener with every song before filling in play counts. By accident (a forgotten ON on large tables) it multiplies the rows and the totals.',
      sql: 'SELECT l.name, s.title\nFROM listeners l\nCROSS JOIN songs s;',
      ins: [{ t: 'listeners' }, { t: 'songs' }],
      out: { c: ['name', 'title'], r: [['Ada', 'Heaven Baby'], ['Ada', 'Forgiveness'], ['Ada', 'Calm Down'], ['Tunde', 'Heaven Baby'], ['Tunde', 'Forgiveness'], ['Tunde', 'Calm Down'], ['Zainab', 'Heaven Baby'], ['Zainab', 'Forgiveness'], ['Zainab', 'Calm Down']] } }),
    Q_(mcq('sql5.j12', 'Why does the CROSS JOIN result have 9 rows?',
      ['3 listeners × 3 songs: every pair, with no matching rule', 'one per stream, plus 5 extra', 'it repeats the songs table 3 times by mistake', '3 + 3 + 3 streams'],
      [null, 'CROSS JOIN does not read streams at all.', 'Repeating every song once per listener is exactly what CROSS JOIN is defined to do.', 'There are 4 streams, and CROSS JOIN does not use them.'],
      'CROSS JOIN returns rows(first) × rows(second) because it pairs every row with every row.', { ts: 'j', only: ['listeners', 'songs'] })),
    Q_(mcq('sql5.j12t', 'A bank has 1,000 accounts and a table of 48 months. How many rows does <code>accounts CROSS JOIN months</code> return?',
      ['48,000', '1,048', '1,000', '48'],
      [null, 'That adds the row counts; a cross join multiplies them.', 'Every account is repeated once per month.', 'Every month is repeated once per account.'],
      '1,000 × 48 = 48,000: one row for each (account, month) pair, the usual start of a monthly balance report.', { ref: false })),
    S_({ h: 'Next: joins that keep unmatched rows', fig: 'cnt', fp: [['plain JOIN', 'matches only'], ['LEFT/RIGHT/FULL', 'keep unmatched rows too']],
      link: 'Every join in Steps 7 to 12 was JOIN on its own (INNER JOIN), which keeps only matched pairs, so it dropped Zainab and the orphan stream.',
      ask: 'How do you keep the rows that have no match?',
      say: 'The next pictures answer that with a new pair of tables, <code>artists</code> and <code>songs</code>. In this pair, Asake has no song and Mystery Song points to an artist who does not exist, so each side has one row without a partner.' })
  ], legacy);
  L.qs.forEach(q => { if (/^sql5\.(j9|j11$)/.test(q.id || '')) q.v101 = 1; }); // v10.1: rewritten Step 9 and the Step 12 question
  // legacy scenes: a question banner first, and wrong options explained where a count was asked
  const asks = ['Which table is LEFT and which is RIGHT?', 'Which rows have a partner on the other side?', 'Which rows does LEFT JOIN keep?', 'Which rows does RIGHT JOIN keep?', 'Which rows does FULL OUTER JOIN keep?', 'What changes when the two tables swap places?'];
  asks.forEach((a, i) => { if (L.scenes[i]) L.scenes[i].ask = a; });
  L.qs[2].w = [null, '3 forgets one unmatched row: FULL keeps both Asake and Mystery Song.', '2 is the INNER JOIN count: matches only.', '6 would be every artist with every song (3 × 2).'];
  L.qs[5].w = [null, '2 is only the matches; RIGHT JOIN also keeps Mystery Song.', '4 is FULL OUTER JOIN: it would also keep Asake.', 'Every song stays, and there are 3 songs.'];
}
/* sqlm: P5 split into three pictures (picture audit §1) and the pair-key INSERT */
{
  const L = ILLUS.sqlm; L.id = 'sqlm';
  L.tables.playlist_songs = ILT('playlist_songs', ['playlist_id', 'song_id'], [[1, 10], [1, 12], [2, 11], [2, 10]], 'CREATE TABLE playlist_songs (playlist_id INTEGER, song_id INTEGER, PRIMARY KEY (playlist_id, song_id));');
  const p5 = L.scenes[4];
  Object.assign(p5, { v10: 1, h: 'Same pattern: songs on playlists', ins: [{ t: 'playlists' }, { t: 'playlist_songs', role: 'the linking table: one row per (playlist, song) pair' }], out: undefined, sql: undefined, lg: undefined,
    link: 'Streams linked listeners and songs. A playlist and its songs are the same shape: many on both sides.',
    say: 'A song can be on many playlists, and a playlist holds many songs, so neither table can hold the other’s ID in one column. The linking table <code>playlist_songs</code> holds one row per pair: (1, 10) means song 10 is on playlist 1. The next two pictures use it to answer a question and to show why the same pair cannot be stored twice.' });
  const seq = [
    S_({ h: 'Which songs are on Naija Hits?',
      link: 'The previous picture showed that each playlist_songs row is one (playlist, song) pair.',
      ask: 'Which songs are on the playlist Naija Hits?',
      say: 'Naija Hits has playlist_id 1. Keep the pairs whose playlist_id is 1, then follow each kept song_id to <code>songs</code> for the title. The first JOIN brings in the playlist name so the WHERE can test it; the second brings in the title.',
      sql: "SELECT p.name AS playlist, s.title\nFROM playlist_songs ps\nJOIN playlists p ON p.playlist_id = ps.playlist_id\nJOIN songs s     ON s.song_id = ps.song_id\nWHERE p.name = 'Naija Hits';",
      ins: [{ t: 'playlist_songs', m: ['m', 'm', 'x', 'x'], role: 'the link', why: ['playlist 1 is Naija Hits; song 10 is Last Last', 'playlist 1 is Naija Hits; song 12 is Joha', 'playlist 2 is Chill, so WHERE removes it', 'playlist 2 is Chill, so WHERE removes it'] }],
      out: { c: ['playlist', 'title'], r: [['Naija Hits', 'Last Last'], ['Naija Hits', 'Joha']], m: ['m', 'm'], why: ['from the pair (1, 10)', 'from the pair (1, 12)'] },
      lg: { m: '✓ pair on Naija Hits', x: '✕ pair on another playlist' } }),
    S_({ h: 'The pair is the key',
      link: 'Naija Hits came from two pairs with playlist_id 1. Each pair is stored once.',
      ask: 'What happens if you add a pair that is already there, and what if only one half of it repeats?',
      say: 'The primary key of <code>playlist_songs</code> is the pair <code>(playlist_id, song_id)</code>. A primary key made of more than one column is called a <b>composite key</b>: the whole combination must be unique, while each column on its own may repeat. Adding (1, 10) again fails with “UNIQUE constraint failed”, because that exact pair exists. Adding (2, 12) is allowed: playlist 2 and song 12 each already appear, but never together, and only the whole pair must be unique.',
      sql: 'INSERT INTO playlist_songs VALUES (1, 10);',
      ins: [{ t: 'playlist_songs', m: ['x', '', '', ''], why: ['(1, 10) already exists, so a second (1, 10) is refused'] }],
      out: { err: 'UNIQUE constraint failed: playlist_songs.playlist_id, playlist_songs.song_id' },
      after: [{ tab: ILT('playlist_songs', ['playlist_id', 'song_id'], [[1, 10], [1, 12], [2, 11], [2, 10], [2, 12]]), m: ['', '', '', '', 'n'], role: 'After INSERT (2, 12): allowed', why: [null, null, null, null, 'new pair: playlist 2 and song 12 have not appeared together before'] }],
      lg: { x: '✕ refused: the pair already exists', n: '＋ added: a new pair' } }),
    Q_(mcq('sqlm.pk1', 'playlist_songs already holds (1, 10), (1, 12), (2, 11) and (2, 10). Which INSERT fails?',
      ['INSERT INTO playlist_songs VALUES (2, 11);', 'INSERT INTO playlist_songs VALUES (2, 12);', 'INSERT INTO playlist_songs VALUES (1, 11);', 'INSERT INTO playlist_songs VALUES (3, 10);'],
      [null, 'Playlist 2 and song 12 have never been paired, so the pair is new.', 'Playlist 1 and song 11 have never been paired, so the pair is new.', 'The key does not check that playlist 3 exists; only a foreign key would. The pair (3, 10) is new.'],
      'Only the exact pair (2, 11) already exists. With a composite key, each half may repeat; the whole pair may not.')),
    Q_(mcq('sqlm.pk2', 'A school stores <code>enrolments(student_id, course_id)</code> with PRIMARY KEY (student_id, course_id). What does that key stop?',
      ['the same student being enrolled in the same course twice', 'a student taking more than one course', 'a course having more than one student', 'a student with no courses'],
      [null, 'student_id alone may repeat: (7, 1) and (7, 2) are different pairs.', 'course_id alone may repeat: (7, 1) and (8, 1) are different pairs.', 'Keys constrain rows that exist; a student with no rows is not affected.'],
      'A composite key makes the combination unique, which is exactly “one enrolment per student per course”.', { ref: false }))
  ];
  const legacy = L.scenes.map((_, i) => ['s', i]); const lq = L.qs.map((_, i) => ['q', i]);
  v10Seq(L, seq, []);
  const newOrder = L.order; L.order = legacy.concat(newOrder, lq);
  L.qs[0].w = [null, 'There are 3 listeners, but each stream is its own row and Ada has two.', 'There are 3 songs, but Last Last is played by two streams.', 'ON keeps only matching pairs; nothing is multiplied.'];
}
/* rung 2: joins in combination (new lesson) */
ILLUS.sqlc = { id: 'sqlc', rung: 2, tables: JT, tsets: { j: JT, j5: JT5, shop2: {
    customers: ILT('customers', ['customer_id', 'name'], [[21, 'Bisi'], [22, 'Kunle']], 'CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT);'),
    orders: ILT('orders', ['order_id', 'customer_id', 'total'], [[1, 21, 5000], [2, 22, 3000]], 'CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, total INTEGER);'),
    order_items: ILT('order_items', ['order_id', 'product'], [[1, 'rice'], [1, 'oil'], [2, 'beans']], 'CREATE TABLE order_items (order_id INTEGER, product TEXT);') } },
  scenes: [], qs: [] };
{
  const L = ILLUS.sqlc;
  const BROKEN = 'SELECT c.name, SUM(o.total) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nJOIN order_items i ON i.order_id = o.order_id\nGROUP BY c.customer_id, c.name;';
  v10Seq(L, [
    S_({ h: 'Drill 1 · For each listener, the titles they played', ts: 'j',
      link: 'In <i>Joins</i> you joined streams to listeners and to songs, one pointer per JOIN. Now combine those pieces to answer questions.',
      ask: 'For each listener, which titles did they play?',
      say: 'Before writing anything, decide what one result row stands for. That is the <b>grain</b> of the result, the same idea as the grain of a table in <i>What’s inside a table</i>. The next question asks you exactly that.', ins: [{ t: 'listeners' }, { t: 'streams' }, { t: 'songs' }], stack: true }),
    Q_(mcq('sqlc.d1p', 'Plan: what should one row of the result stand for?',
      ['one stream: a listener and a title they played', 'one listener, with all their titles in one cell', 'one song', 'one pair from every listener with every song'],
      [null, 'A cell holds one value; a list of titles in one cell needs a special function and is not what the join gives.', 'The question is per listener and title, and a title can be played by several listeners.', 'That is a CROSS JOIN; it would list songs nobody played.'],
      'Each play is a (listener, title) fact, so the grain is one stream: start FROM streams and follow both pointers.', { ts: 'j' })),
    S_({ h: 'Drill 1 · Build it', ts: 'j',
      link: 'The plan says one row per stream.',
      ask: 'For each listener, which titles did they play?',
      say: 'One row per stream is the grain, so start FROM streams. Then join listeners for the name and songs for the title, then sort by name so each listener’s titles sit together.',
      sql: 'SELECT l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s     ON s.song_id = st.song_id\nORDER BY l.name, s.title;',
      ins: [{ t: 'streams', m: ['m', 'm', 'm', 'm'], why: ['Ada · Calm Down', 'Ada · Forgiveness', 'Tunde · Calm Down', 'Tunde · Heaven Baby'] }],
      out: { c: ['name', 'title'], r: [['Ada', 'Calm Down'], ['Ada', 'Forgiveness'], ['Tunde', 'Calm Down'], ['Tunde', 'Heaven Baby']], m: ['m', 'm', 'm', 'm'], why: ['stream 1', 'stream 2', 'stream 3', 'stream 4'] } }),
    S_({ h: 'Drill 2 · How many different songs per listener?', ts: 'j',
      link: 'Drill 1 gave one row per stream, so a listener appears once per play.',
      ask: 'How many different songs did each listener play?',
      say: '<code>COUNT(*)</code> counts rows, which here means plays. <code>COUNT(DISTINCT st.song_id)</code> counts different song IDs in the group. With these four streams nobody repeated a song, so both counts are 2 for Ada and 2 for Tunde. Drill 3 changes one row to show the difference.',
      sql: 'SELECT l.name, COUNT(*) AS plays, COUNT(DISTINCT st.song_id) AS songs\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nGROUP BY l.listener_id, l.name;',
      ins: [{ t: 'streams', m: ['g0', 'g0', 'g1', 'g1'] }],
      out: { c: ['name', 'plays', 'songs'], r: [['Ada', 2, 2], ['Tunde', 2, 2]], m: ['g0', 'g1'], nc: [1, 2] }, lg: { g: 'same colour = one listener’s group' } }),
    S_({ h: 'Drill 3 · One change: Ada plays Calm Down again', ts: 'j5',
      link: 'In Drill 2 both counts were equal. Now one row is added and nothing else changes.',
      ask: 'What happens to plays and to songs for Ada?',
      say: 'Stream 5 is Ada playing Calm Down (song 14) a second time. Work out both counts for Ada before you read on.',
      ins: [{ t: 'streams', m: ['', '', '', '', 'n'], why: [null, null, null, null, 'new: Ada (1) plays Calm Down (14) again'] }], lg: { n: '＋ the one added row' } }),
    Q_(mcq('sqlc.d3', 'With stream 5 added, what are COUNT(*) and COUNT(DISTINCT st.song_id) for Ada?',
      ['3 and 2', '2 and 2', '3 and 3', '2 and 3'],
      [null, 'COUNT(*) counts every row in Ada’s group, and there are now 3.', 'Calm Down appears twice, and DISTINCT counts it once.', 'DISTINCT cannot be larger than the row count.'],
      'Ada has 3 rows (plays) but only 2 different song IDs (14 and 8). Count plays with COUNT(*), and count different songs with COUNT(DISTINCT song_id).', { ts: 'j5', rv: 1 })),
    S_({ h: 'Drill 3 · The two counts side by side', ts: 'j5',
      link: 'Ada now has three plays of two different songs.',
      ask: 'Which count answers “how many different songs”?',
      say: 'Only <code>COUNT(DISTINCT st.song_id)</code> answers it. <code>COUNT(*)</code> answers “how many plays”.',
      sql: 'SELECT l.name, COUNT(*) AS plays, COUNT(DISTINCT st.song_id) AS songs\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nGROUP BY l.listener_id, l.name;',
      ins: [{ t: 'streams', m: ['g0', 'g0', 'g1', 'g1', 'g0'] }],
      out: { c: ['name', 'plays', 'songs'], r: [['Ada', 3, 2], ['Tunde', 2, 2]], m: ['n', ''], nc: [1, 2], why: ['3 plays (streams 1, 2, 5), but 2 different songs (14 and 8)'] },
      lg: { g: 'same colour = one listener’s group', n: '＋ changed by the added row' } }),
    S_({ h: 'Drill 4 · Spot the mistake: doubled totals', ts: 'shop2', qlast: true,
      link: 'In <i>Joins</i> Step 9 you saw fan-out: a row on the one side is repeated once for each matching row on the many side. Here that repetition hides inside a SUM.',
      ask: 'Finance says Bisi spent 5,000. Why does this query say 10,000?',
      say: 'A colleague wanted each customer’s total spend and joined order_items too. Read the query and the result first; the next screen asks which line causes it.',
      sql: BROKEN, stack: true,
      ins: [{ t: 'customers' }, { t: 'orders' }, { t: 'order_items' }],
      out: { c: ['name', 'spent'], r: [['Bisi', 10000], ['Kunle', 3000]], m: ['x', 'm'], why: ['wrong: order 1’s total of 5,000 is added once per item (rice, oil)', 'right by luck: order 2 has only one item'] },
      lg: { x: '✕ wrong total', m: '✓ correct total' } }),
    Q_({ id: 'sqlc.d4', k: 'line', ts: 'shop2', rv: 1, q: 'Bisi’s one order totals 5,000, but this query reports 10,000. Tap the line that doubles her total.', code: BROKEN, ans: 3,
      why: 'Joining order_items repeats order 1 once per item (2 items), so SUM adds its 5,000 twice. The question needs no item data.',
      lw: 'Lines 1–3 alone give one row per order. Line 4 joins from the one side (orders) to the many side (order_items): fan-out. Line 5 groups correctly; it only adds up what it is given.' }),
    Q_(mcq('sqlc.d4f', 'Which fix is correct for every customer, not just for this data?',
      ['remove the order_items join, because the question needs no item data', 'use SUM(DISTINCT o.total)', 'use COUNT(o.total) instead of SUM', 'add ORDER BY c.name'],
      [null, 'Two different orders with the same total (two 3,000 orders) would be counted once: right here, wrong elsewhere.', 'COUNT gives how many rows, not how much money.', 'Sorting changes the order of rows, not the sums.'],
      'Remove the join that changes the grain. If item data were needed, add up the items per order first, then join one row per order.', { ts: 'shop2', rv: 1 })),
    S_({ h: 'Drill 4 · The fix', ts: 'shop2',
      link: 'The extra join repeated order 1. Without it, each order is one row again.',
      ask: 'What does each customer really spend?',
      say: 'With only customers and orders, each order is one row, so each total is added once.',
      sql: 'SELECT c.name, SUM(o.total) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name;',
      ins: [{ t: 'orders', m: ['m', 'm'], why: ['order 1 counted once: 5,000 for Bisi', 'order 2 counted once: 3,000 for Kunle'] }],
      out: { c: ['name', 'spent'], r: [['Bisi', 5000], ['Kunle', 3000]], m: ['m', 'm'], why: ['matches finance: 5,000', 'unchanged: 3,000'] } })
  ]);
}
/* rung 3: one real task, planned then built piece by piece */
ILLUS.sqlrt = { id: 'sqlrt', rung: 3, tables: {
    customers: ILT('customers', ['customer_id', 'name'], [[21, 'Bisi'], [22, 'Kunle'], [23, 'Ngozi']], 'CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT);'),
    orders: ILT('orders', ['order_id', 'customer_id', 'order_date'], [[1, 21, '2026-09-28'], [2, 21, '2026-10-03'], [3, 22, '2026-10-05'], [4, 21, '2026-10-11'], [5, 23, '2026-10-14'], [6, 21, '2026-10-25'], [7, 22, '2026-10-19']], 'CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT);') },
  scenes: [], qs: [] };
{
  const L = ILLUS.sqlrt; const OCT = "order_date >= '2026-10-01' AND order_date < '2026-11-01'";
  const OCTR = [[2, 21, '2026-10-03'], [3, 22, '2026-10-05'], [4, 21, '2026-10-11'], [5, 23, '2026-10-14'], [6, 21, '2026-10-25'], [7, 22, '2026-10-19']];
  const plan = (id, key, pl, q, o, w, why) => mcq(id, q, o, w, why, { plan: key, pl, link: 'The request: <b>Which customers placed more than two orders in October 2026?</b>' });
  const WRONG = "SELECT c.name, COUNT(*) AS n_orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE o." + OCT + "\n  AND COUNT(*) > 2\nGROUP BY c.customer_id, c.name;";
  const WRONG2 = "SELECT c.name, COUNT(*) AS n_orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE o." + OCT + "\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) >= 2;";
  v10Seq(L, [
    S_({ h: 'The request', ask: 'Which customers placed more than two orders in October 2026?',
      link: 'In <i>Joins in combination</i> you planned the grain before each query. Here the whole task is one sentence, as it arrives at work.',
      say: 'Before writing SQL, answer four planning questions. Each answer fixes one part of the query, and the build steps after them use your answers.',
      ins: [{ t: 'customers' }, { t: 'orders' }] }),
    Q_(plan('sqlrt.p1', 'grain', 'One result row', 'Plan 1 of 4: what does one row of the final result stand for?',
      ['one customer', 'one order', 'one October day', 'one order per customer'],
      [null, 'The request names customers, not orders: orders are what we count.', 'Days are not asked about; dates only decide which orders count.', 'That is still one order; the answer lists each customer once.'],
      'The request asks “which customers”, so each customer appears once.')),
    Q_(plan('sqlrt.p2', 'tables', 'Tables', 'Plan 2 of 4: which tables hold the facts you need?',
      ['orders for dates and counting, customers for the names, joined on customer_id', 'only customers', 'only orders, showing customer_id instead of a name', 'customers CROSS JOIN orders'],
      [null, 'customers has no order dates, so it cannot count October orders.', 'That would answer the question, but people reading it need names; the name lives in customers.', 'A CROSS JOIN pairs every customer with every order, including other customers’ orders.'],
      'orders holds the events (one row per order, with its date); customers holds the names. They connect through orders.customer_id.')),
    Q_(plan('sqlrt.p3', 'filter', 'Rows that count', 'Plan 3 of 4: which orders count?',
      ["orders dated in October 2026: order_date >= '2026-10-01' AND order_date < '2026-11-01'", 'all orders', "orders with order_date = '2026-10'", "orders with order_date >= '2026-10-01' and no end"],
      [null, 'Order 1 is from September; the request is about October only.', "No row holds exactly '2026-10'; the dates are full days like '2026-10-03'.", 'Without an end, November orders would count too.'],
      'This is a half-open range: it includes its start (>= 1 October) and stops just before its end (< 1 November), so it covers every day and time in October and nothing after it. This is a filter on single rows, so it goes in WHERE.')),
    Q_(plan('sqlrt.p4', 'test', 'Test on each group', 'Plan 4 of 4: which test picks “more than two orders”, and where does it go?',
      ['COUNT(*) > 2, in HAVING after GROUP BY', 'COUNT(*) > 2, in WHERE', 'COUNT(*) >= 2, in HAVING', 'order_id > 2, in WHERE'],
      [null, 'WHERE runs on single rows before groups exist, so it cannot use a count.', '>= 2 means two or more; “more than two” means at least three.', 'order_id is a row number, not a count of orders.'],
      'A count belongs to a group of rows, so the test goes in HAVING, which runs after GROUP BY.')),
    S_({ h: 'Build 1 · Keep only October orders', plan: ['filter'],
      link: 'Your plan starts with the rows that count.',
      ask: 'Which orders are from October 2026?',
      sql: 'SELECT order_id, customer_id, order_date\nFROM orders\nWHERE ' + OCT + ';',
      say: 'Run only the filter first and check it. Six of the seven orders are from October.',
      ins: [{ t: 'orders', m: ['x', 'm', 'm', 'm', 'm', 'm', 'm'], why: ['28 September: before 1 October', '3 October', '5 October', '11 October', '14 October', '25 October', '19 October'] }],
      out: { c: ['order_id', 'customer_id', 'order_date'], r: OCTR }, lg: { x: '✕ not October', m: '✓ October' } }),
    S_({ h: 'Build 2 · One group per customer, counted', plan: ['grain'],
      link: 'Build 1 left 6 October orders.',
      ask: 'How many October orders does each customer have?',
      sql: 'SELECT customer_id, COUNT(*) AS n_orders\nFROM orders\nWHERE ' + OCT + '\nGROUP BY customer_id;',
      say: 'GROUP BY customer_id makes one group per customer, which matches the grain in your plan. COUNT(*) counts the October orders in each group.',
      ins: [{ tab: ILT('after Build 1', ['order_id', 'customer_id', 'order_date'], OCTR), m: ['g0', 'g1', 'g0', 'g2', 'g0', 'g1'], role: 'Before: the October orders' }],
      out: { c: ['customer_id', 'n_orders'], r: [[21, 3], [22, 2], [23, 1]], m: ['g0', 'g1', 'g2'], nc: [1] }, lg: { g: 'same colour = one customer’s group' } }),
    S_({ h: 'Build 3 · Keep the groups with more than two', plan: ['test'],
      link: 'Build 2 counted 3, 2 and 1 October orders.',
      ask: 'Which of those counts are more than two?',
      sql: 'SELECT customer_id, COUNT(*) AS n_orders\nFROM orders\nWHERE ' + OCT + '\nGROUP BY customer_id\nHAVING COUNT(*) > 2;',
      say: 'HAVING tests each group after counting. Only 3 is more than two.',
      ins: [{ tab: ILT('after Build 2', ['customer_id', 'n_orders'], [[21, 3], [22, 2], [23, 1]]), m: ['m', 'x', 'x'], role: 'Before: one row per customer', why: ['3 > 2: kept', '2 is not more than two: removed', '1 is not more than two: removed'] }],
      out: { c: ['customer_id', 'n_orders'], r: [[21, 3]], m: ['m'], why: ['customer 21 has 3 October orders'] } }),
    S_({ h: 'Build 4 · Add the names', plan: ['tables', 'grain', 'filter', 'test'],
      link: 'Build 3 found customer 21. People reading the answer need a name, not an ID.',
      ask: 'Which customers placed more than two orders in October 2026?',
      sql: 'SELECT c.name, COUNT(*) AS n_orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE o.' + OCT + '\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) > 2;',
      say: 'Joining customers follows orders.customer_id to the name. Each order still names one customer, so the join adds a column without changing the counts. Group by the ID as well as the name, in case two customers share a name.',
      ins: [{ t: 'customers', m: ['m', 'x', 'x'], why: ['3 October orders: passes the test', '2 October orders: fails the test', '1 October order: fails the test'] }],
      out: { c: ['name', 'n_orders'], r: [['Bisi', 3]], m: ['m'], why: ['Bisi: orders 2, 4 and 6'] } }),
    Q_({ id: 'sqlrt.c1', k: 'run', rv: 1, q: 'Change one thing: list the customers with <b>at least two</b> October orders.', code: 'SELECT c.name, COUNT(*) AS n_orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE o.' + OCT + '\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) ____;',
      sol: 'SELECT c.name, COUNT(*) AS n_orders FROM customers c JOIN orders o ON o.customer_id = c.customer_id WHERE o.' + OCT + ' GROUP BY c.customer_id, c.name HAVING COUNT(*) >= 2;',
      why: '“At least two” is >= 2, so Kunle (2) joins Bisi (3).' }),
    S_({ h: 'Spot the mistake 1 · A count in WHERE',
      link: 'Your plan put the count test in HAVING. A colleague put it somewhere else.',
      ask: 'Why does this query fail?',
      sql: WRONG, say: 'The database refuses it before reading any rows. The next screen asks which line is wrong.', qlast: true,
      ins: [{ t: 'orders' }], out: { err: 'misuse of aggregate: COUNT()' } }),
    Q_({ id: 'sqlrt.s1', k: 'line', rv: 1, q: 'Tap the line that makes the query fail.', code: WRONG, ans: 4,
      why: 'WHERE tests one row at a time, before GROUP BY makes groups, so there is no count yet. Move the test to HAVING COUNT(*) > 2 after GROUP BY.',
      lw: 'The date filter on line 4 is correct in WHERE: it is about single orders. Only the count test is in the wrong clause.' }),
    S_({ h: 'Spot the mistake 2 · Off by one',
      link: 'The fixed query runs, but a second colleague’s version returns two customers.',
      ask: 'Kunle has exactly 2 October orders. Is that “more than two”?',
      sql: WRONG2, say: 'It runs without error, which makes the mistake easy to miss. Compare the result with your plan.', qlast: true,
      ins: [{ t: 'customers' }],
      out: { c: ['name', 'n_orders'], r: [['Bisi', 3], ['Kunle', 2]], m: ['m', 'x'], why: ['3 is more than two: correct', '2 is not more than two: should not be here'] }, lg: { x: '✕ should not be in the answer' } }),
    Q_({ id: 'sqlrt.s2', k: 'line', rv: 1, q: 'Tap the line that lets Kunle in.', code: WRONG2, ans: 5,
      why: '>= 2 means “two or more”. “More than two” is > 2, which needs at least 3 orders.',
      lw: 'Every other line matches the plan: the grain, the tables, the October filter and the grouping.' }),
    S_({ h: 'Same plan, new data: the naija chart',
      link: 'The four planning questions worked for the shop. They work for any question of this shape.',
      ask: 'Which artists had a song in the top 5 on more than one chart day?',
      say: 'One row per artist. Tables: <code>chart_entries</code> (position and day), <code>songs</code> (to reach the artist) and <code>artists</code> (the name). Rows that count: <code>position &lt;= 5</code>. Test on each artist’s group: more than one <b>day</b>. The next question asks how to count days; then you write the full query on the real chart data in this lesson’s problem.' }),
    Q_(mcq('sqlrt.n1', 'An artist can have two songs in the top 5 on the same day. Which test counts chart <b>days</b> correctly?',
      ['HAVING COUNT(DISTINCT c.chart_date) > 1', 'HAVING COUNT(*) > 1', 'HAVING COUNT(DISTINCT c.song_id) > 1', 'WHERE COUNT(c.chart_date) > 1'],
      [null, 'COUNT(*) counts entries: two songs on one day give 2 for a single day.', 'That counts different songs, not different days.', 'WHERE cannot use a count, and COUNT without DISTINCT counts entries again.'],
      'Each day should be counted once per artist, however many of their songs were in the top 5 that day.', { ref: false, rv: 1 }))
  ]);
}

/* v10: a specific reason for every marked row of the older pictures, keyed 'lesson|picture title'; arrays follow the rows (null = unmarked) */
var ILL_WHY = {
  'sql5|INNER JOIN: only matches': {
    i0: ['song 10 (Last Last) has artist_id 1', 'song 11 (Free Mind) has artist_id 2', 'no song has artist_id 3, so INNER JOIN drops Asake'],
    i1: ['artist_id 1 is Burna Boy', 'artist_id 2 is Tems', 'artist_id 9 matches no artist, so INNER JOIN drops it'],
    out: ['Burna Boy paired with Last Last', 'Tems paired with Free Mind'] },
  'sql5|LEFT JOIN: every left row stays': {
    i0: ['matched: Last Last', 'matched: Free Mind', 'no song matches, but LEFT JOIN keeps every left row'],
    i1: ['matches Burna Boy', 'matches Tems', 'artist 9 does not exist, and LEFT JOIN keeps unmatched rows only from the left side'],
    out: ['Burna Boy with Last Last', 'Tems with Free Mind', 'Asake kept; the songs columns are NULL because nothing matched'] },
  'sql5|RIGHT JOIN: every right row stays': {
    i0: ['matched by Last Last', 'matched by Free Mind', 'no song matches, and RIGHT JOIN keeps unmatched rows only from the right side'],
    i1: ['matches Burna Boy', 'matches Tems', 'artist 9 does not exist, but RIGHT JOIN keeps every right row'],
    out: ['Last Last with Burna Boy', 'Free Mind with Tems', 'Mystery Song kept; name is NULL because no artist has ID 9'] },
  'sql5|FULL OUTER JOIN: everything from both': {
    i0: ['matched by Last Last', 'matched by Free Mind', 'no match, kept because FULL keeps unmatched left rows'],
    i1: ['matches Burna Boy', 'matches Tems', 'no match, kept because FULL keeps unmatched right rows'],
    out: ['matched pair', 'matched pair', 'Asake with NULL song columns', 'Mystery Song with a NULL name'] },
  'sql5|Swap the order, swap the roles': {
    i0: ['matches Burna Boy', 'matches Tems', 'no artist 9, kept because songs is now the LEFT table'],
    i1: ['matched by Last Last', 'matched by Free Mind', 'no song points to artist 3, and artists is now the right side'],
    out: ['Last Last with Burna Boy', 'Free Mind with Tems', 'Mystery Song kept with a NULL name'] },
  'sql2|WHERE keeps fewer rows': {
    i0: ['900 > 800 is TRUE', '1200 > 800 is TRUE', '700 > 800 is FALSE', 'NULL > 800 is UNKNOWN, and WHERE keeps only TRUE'],
    out: ['song 1: 900', 'song 2: 1200'] },
  'sql2|Finding the missing values': {
    i0: ['900 is a value, so IS NULL is FALSE', '1200 is a value, so IS NULL is FALSE', '700 is a value, so IS NULL is FALSE', 'streams is NULL, so IS NULL is TRUE'],
    out: ['song 4: the missing count'] },
  'sql3|ORDER BY + LIMIT: sort, then cut': {
    i0: ['900: second highest', '1200: highest', '700: third, cut by LIMIT 2', '500: fourth, cut by LIMIT 2'],
    out: ['1st after sorting by streams DESC', '2nd after sorting'] },
  'sql4|WHERE filters rows before grouping': {
    i0: [null, '500 < 700: removed before grouping', null, null, '300 < 700: removed before grouping'] },
  'sql4|HAVING filters groups after grouping': {
    i0: [null, null, null, 'Wizkid’s group totals 700, not above 1000: the whole group is removed', null] },
  'sql4|A column that is neither grouped nor aggregated': {
    a0: ['two titles in the group (Calm Down, Charm) but one cell', 'two titles in the group (Free Mind, Me & U) but one cell', null] },
  'sql6|A subquery used as a filter': {
    i0: ['1200 > 700 (the average)', '500 is not above 700', '800 > 700', '700 equals the average, so it is not above it', '300 is not above 700'],
    out: ['above the average', 'above the average'] },
  'sql7|A CTE is a named, temporary result': {
    i1: [null, null, '700 is not above 1000: removed by the final WHERE'] },
  'sql7|UNION ALL stacks every row': {
    out: [null, null, 'Calm Down again, from Tuesday: UNION ALL keeps both copies', null] },
  'sql7|UNION removes duplicates': {
    i1: ['also on Monday’s chart, so UNION keeps only one Calm Down', null] },
  'sql8|Why the key is song_id, not the title': {
    out: [null, 'song 6 is new, but it shares the title Love, so LAG hands it song 5’s position 3', 'song 5 gets 2, song 6’s position, instead of its own 3'] },
  'sql9|Cleaning keeps the rows, fixes the values': {
    i0: ['spaces around Rush, and 900 stored as text', 'streams is missing (NULL)', '\u2018700\u2019 is stored as text; the title is already clean'],
    out: ['trimmed + cast: \u2018  Rush \u2019 → Rush, \u2018900\u2019 → 900', 'NULL → 0 by COALESCE', 'cast \u2018700\u2019 → 700 (title already clean)'] },
  'etl1|Transform: raw → staging': {
    i0: ['leading space and text \u2018900\u2019: will be trimmed and cast', 'title is NULL: fails the rule, dropped', 'trailing space and text \u2018700\u2019: will be trimmed and cast'],
    out: ['trimmed, and \u2018900\u2019 → 900', 'trimmed, and \u2018700\u2019 → 700'] },
  'etl2|A retry with plain INSERT duplicates rows': {
    out: ['the 10-16 load', 'the 10-16 load', 'the first 10-17 load', 'the first 10-17 load', 'inserted again by the retry: a duplicate', 'inserted again by the retry: a duplicate'] },
  'etl2|Delete-then-insert is idempotent': {
    i0: ['other date: not touched', 'other date: not touched', 'run date 10-17: deleted first', 'run date 10-17: deleted first'],
    i1: ['inserted after the delete', 'inserted after the delete'],
    out: ['unchanged', 'unchanged', 'from the batch, once', 'from the batch, once'] },
  'etl4|A quality check that should return zero rows': {
    i0: [null, null, 'track 2 appears once, so HAVING COUNT(*) > 1 removes it'] },
  'etl4|Dedupe: keep the latest row per key': {
    i0: ['older load of track 1 (rn = 2): dropped', null, null] },
  'pj3|Flattening: nested JSON → one row per track': {
    out: ['first item in tracks → position 1', 'second item in tracks → position 2'] },
  'pj4|The primary key refuses a duplicate load': {
    i1: ['(10-17, 1) is already in chart_entries: this key causes the failure', '(10-17, 2) is already in chart_entries: a second conflict', 'not inserted: the statement failed as a whole'] },
  'pj4|load.py: delete the date, then insert': {
    i0: ['10-16 is not the run date: not touched', 'run date 10-17: deleted first', 'run date 10-17: deleted first'],
    i1: ['inserted after the delete', 'inserted after the delete', 'inserted after the delete (arrived late)'],
    out: ['unchanged', 'from the fresh batch', 'from the fresh batch', 'new: Charm arrived late'] },
  'sqlr|One big table repeats itself': {
    i0: ['Burna Boy and Spaceship, copy 1 of 3', 'Burna Boy and Spaceship, copy 2 of 3', 'copy 3 of 3, with a typo: Burna Boi', 'Tems and RCA, copy 1 of 2', 'Tems and RCA, copy 2 of 2'] },
  'sqlr|Problem 1: an update misses copies': {
    i0: ['the only row the UPDATE matches (title = Last Last)', 'another copy of Burna Boy’s label: not updated', 'another copy (typed Burna Boi): not updated', null, null],
    out: ['now says Atlantic', 'still says Spaceship: disagrees with row 1', 'still says Spaceship: disagrees with row 1'] },
  'sqlr|Problem 2: a typo invents an artist': {
    i0: ['correct spelling', 'correct spelling (same pair as row 1)', 'typo: Burna Boi', 'correct spelling', 'correct spelling (same pair as row 4)'],
    out: ['the real artist', 'the typo counted as a second artist', 'the real artist'] },
  'sqlr|The fix: split it so each fact lives once': {
    i0: ['artist and label copied: Burna Boy 1 of 3', 'copied: Burna Boy 2 of 3', 'copied with a typo: Burna Boi', 'copied: Tems 1 of 2', 'copied: Tems 2 of 2'],
    a0: ['Burna Boy stored once, with ID 1', 'Tems stored once, with ID 2', 'Asake stored once, even with no song yet'] },
  'sqlr|State: a fact that changes and gets overwritten': {
    i0: ['the row the UPDATE matches (artist_id = 1)', null, null],
    out: ['same row, label overwritten: Spaceship is lost', null, null] },
  'sqlr|A song’s label is a different fact': {
    i0: ['current_label is state: it changes when he signs elsewhere'],
    a0: ['released on Spaceship: stays true after he moves', 'released on Atlantic: a fact about this release'] },
  'sqlr|Events: things that happen, one new row each': {
    out: ['play 1: listener 100, song 10 at 21:14', 'play 2: listener 100, song 11 at 21:18', 'play 3: listener 101, song 10 at 22:02'] },
  'sqlr|A wrong event is fixed by a correction': {
    i0: ['the real charge of 5000', 'charged twice by mistake: kept, not edited', 'the correction: −5000, pointing at payment 2'],
    out: ['5000 + 5000 − 5000 = 5000'] },
  'sqlr|Keys: the arrow from one table to another': {
    out: ['artist_id 1: the row Last Last’s foreign key points at'] },
  'sqlm|Join 1: streams → listeners': {
    i1: [null, null, 'no stream holds listener_id 102, so the plain JOIN never pairs Zainab'] },
  'sqlm|Join 2: … → songs. Two joins, one per arrow': {
    i0: [null, null, 'no streams, so the INNER JOIN drops Zainab'],
    i2: ['named by streams 1 and 3', 'named by stream 2', 'named by stream 4'] },
  'sqlt|The same table as a blueprint (the schema)': {
    out: ['pk = 1: song_id is the primary key', null, null, null, null] },
  'sqlt|A primary key is unique and never NULL': {
    i0: ['has an ID and an email', 'has an ID; email is NULL', 'has an ID; email is NULL'],
    out: ['3 rows, 3 different IDs, 2 missing emails'] },
  'sqlt|One row = one what? (the grain)': {
    i0: ['one row per song: Heaven Baby once', null, null],
    i1: ['Heaven Baby on 10-16', null, 'Heaven Baby on 10-17', null, null],
    out: ['10-16: position 1', '10-17: position 1'] },
  'sqlt|Before: one wide table': {
    i0: ['Ayra Starr copy 1 (Heaven Baby, 10-16)', 'Victony and SLICK copied too, copy 1 of 2', 'Ayra Starr copy 2 (Heaven Baby again, 10-17)', 'Victony and SLICK copied too, copy 2 of 2', 'Ayra Starr copy 3 (Goodbye (Warm Up), 10-17)'] },
  'sqlt|After: each fact lives in the table it describes': {
    i0: ['Ayra Starr copy 1', 'Victony copy 1 of 2', 'Ayra Starr copy 2', 'Victony copy 2 of 2', 'Ayra Starr copy 3'],
    a0: ['Ayra Starr stored once, with ID 1', 'Victony stored once, with ID 2'] },
  'sqlt|Where does the ID go? On the many side': {
    i0: ['a list “1, 11” in one cell', null],
    a0: ['Heaven Baby holds artist_id 1', null, 'Goodbye (Warm Up) holds artist_id 1'] },
  'sqlt|More than one value for one thing? Then it is not one column': {
    i0: ['two genres in one cell', null],
    i1: ['Ayra Starr row 1 of 2: artist_id 1 repeats', 'Ayra Starr row 2 of 2: artist_id 1 repeats', null],
    a0: ['one main genre per song', 'one main genre per song', 'one main genre per song'] },
  'sqlt|Other names: one main name, many aliases': {
    i0: ['three names in one cell'],
    a0: ['one main stage name'],
    a1: ['alias 1, pointing back to artist 3', 'alias 2, pointing back to artist 3'] }
};
// v10 fixes from the picture audit: Victony rows are copies too; Charm was not inserted; sql9 Essence changed (cast)
(() => { const f = (lid, h) => ILLUS[lid] && ILLUS[lid].scenes.find(s => s.h === h);
  Object.keys(ILLUS).forEach(k => { ILLUS[k].id = ILLUS[k].id || k; });
  ['Before: one wide table', 'After: each fact lives in the table it describes'].forEach(h => { const s = f('sqlt', h); if (s) { s.ins[0].m = ['d', 'd', 'd', 'd', 'd']; if (s.lg && s.lg.d) s.lg.d = '2× copied again'; } });
  const p = f('pj4', 'The primary key refuses a duplicate load'); if (p) { p.ins[1].m = ['d', 'd', 'x']; p.lg = Object.assign({}, p.lg, { d: '2× key already exists', x: '✕ not inserted' });
    p.say += ' One conflicting row fails the whole INSERT, so Charm, which has no conflict, is not inserted either.'; }
  const c = f('sql9', 'Cleaning keeps the rows, fixes the values'); if (c) { c.ins[0].m = ['n', 'n', 'n']; c.out.m = ['n', 'n', 'n']; c.lg = { n: '＋ value changed' }; }
  Object.values(ILLUS).forEach(L => L.scenes.forEach(s => { if (s.lg) Object.keys(s.lg).forEach(k => { s.lg[k] = String(s.lg[k]).replace(/⧉/g, '2×'); }); }));
})();

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
const LANG_NAME = { json: 'JSON', sql: 'SQL', python: 'Python', yaml: 'YAML', bash: 'shell', ini: 'pytest.ini' };
const isText = it => it.kind !== 'code';
const DATASETS = {
  music: { label: 'Music sample (artists, songs, chart_entries)', sql: DATASET_SQL, schema: DATASET_SCHEMA },
  project: { label: 'Project 1: chart_entries (same columns as your DuckDB table)', sql: PROJECT_SQL, schema: PROJECT_SCHEMA }
};

/* ============================ v9: AWS FOR DATA ENGINEERING (separate track) ============================
   A track of its own: NOT in CURRICULUM.modules, NOT in READY. Its lessons reuse the lesson engine
   (pictures → questions → theory → items → problems, tiered terms), but every id starts with "aws" and
   the daily SQL session, module % and Roadmap never see it (SCOPE filter). Progress is additive:
   new aws* records inside the existing stores, written only when the learner studies AWS.
   Text is written for DE Daily and checked against the AWS documentation (Nov 2026). */
const AWX = {
  box: (cls, h) => '<div class="aw-' + cls + '">' + h + '</div>',
  hops: hs => '<div class="aw-path">' + hs.map((h, i) => (i ? '<div class="aw-down">↓</div>' : '') + '<div class="aw-hop ' + (h[3] || '') + '"><span class="aw-i">' + h[0] + '</span><div><b>' + h[1] + '</b><div class="small muted">' + h[2] + '</div></div></div>').join('') + '</div>',
  rt: rows => '<table class="mini aw-rtab"><tr><th>Destination</th><th>Target</th></tr>' + rows.map(r => '<tr' + (r[2] ? ' class="aw-hl"' : '') + '><td>' + _h(r[0]) + '</td><td>' + _h(r[1]) + '</td></tr>').join('') + '</table>',
  pol: (json, cap) => '<div class="aw-pol">' + (cap ? '<div class="aw-lab">' + cap + '</div>' : '') + '<pre class="qy">' + _h(json).replace(/&quot;(Effect|Action|Resource|Condition|Principal)&quot;/g, '<b class="aw-k aw-k-$1">&quot;$1&quot;</b>').replace(/&quot;Deny&quot;/g, '<b class="aw-deny">&quot;Deny&quot;</b>').replace(/&quot;Allow&quot;/g, '<b class="aw-allow">&quot;Allow&quot;</b>') + '</pre></div>'
};
const AWS_GLUE_POL = '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::de-raw/sales/*"\n  }]\n}';
const AWS_TLS_POL = '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Deny",\n    "Principal": "*",\n    "Action": "s3:*",\n    "Resource": ["arn:aws:s3:::de-raw",\n                 "arn:aws:s3:::de-raw/*"],\n    "Condition": {"Bool": {"aws:SecureTransport": "false"}}\n  }]\n}';
const AWS_ALL_POL = '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": "s3:*",\n    "Resource": "*"\n  }]\n}';
Object.assign(ILL_FIGS, {
  // the VPC: Region → VPC (CIDR) → AZs → public/private subnets, each with its route table
  awsvpc: sc => { const f = sc.fp || {}; const az = (n, pub, prv) => '<div class="aw-az"><div class="aw-lab">Availability Zone ' + n + '</div>' +
      '<div class="aw-sub pub"><b>Public subnet ' + pub + '</b><div class="small">NAT gateway</div>' + AWX.rt([['10.0.0.0/16', 'local'], ['0.0.0.0/0', 'igw (internet gateway)', f.hl === 'pub']]) + '</div>' +
      '<div class="aw-sub prv"><b>Private subnet ' + prv + '</b><div class="small">Glue job / Redshift network interfaces</div>' + AWX.rt([['10.0.0.0/16', 'local'], ['0.0.0.0/0', 'nat-gw in AZ ' + n, f.hl === 'prv']].concat(f.ep ? [['pl-… (S3 prefix list)', 'vpce-… (gateway endpoint)', true]] : [])) + '</div></div>';
    return '<div class="aw-region"><div class="aw-lab">🗺 Region (example: eu-west-1)</div><div class="aw-vpc"><div class="aw-lab">VPC 10.0.0.0/16</div>' +
      '<div class="aw-igw">🌐 Internet gateway: attached to the whole VPC</div><div class="aw-azs">' + az('a', '10.0.1.0/24', '10.0.2.0/24') + az('b', '10.0.3.0/24', '10.0.4.0/24') + '</div>' +
      (f.ep ? '<div class="aw-ep">🪣 Gateway endpoint for S3: a route-table target, no extra charge</div>' : '') + '</div></div>' +
      '<div class="figcap">The only difference between the two kinds of subnet is the <b>route table</b>: the public one sends 0.0.0.0/0 to the internet gateway, the private one does not.</div>'; },
  awspath: sc => AWX.hops(sc.fp),
  // SG (stateful) vs NACL (stateless): the reply to an allowed HTTPS request
  awssgnacl: sc => { const a = sc.fp && sc.fp.after; const lane = (t, rules, res, ok) => '<div class="aw-lane"><div class="aw-lab">' + t + '</div>' + rules + '<div class="aw-res ' + (ok ? 'ok' : 'bad') + '">' + res + '</div></div>';
    return '<div class="aw-req small">Request: client <code>203.0.113.9:50123</code> → server <code>10.0.1.10:443</code><br>Reply: <code>10.0.1.10:443</code> → <code>203.0.113.9:50123</code></div><div class="aw-lanes">' +
      lane('🛡 Security group (on the server)', '<div class="small">Inbound: allow TCP 443 from 0.0.0.0/0<br>Outbound: <i>no rule for port 50123 needed</i></div>', '✓ Reply allowed: stateful, it remembers the request', true) +
      lane('🧱 Network ACL (on the subnet)', '<div class="small">Inbound: 100 allow TCP 443 · * deny<br>Outbound: ' + (a ? '<b class="ok">110 allow TCP 1024-65535</b> · * deny' : '100 allow TCP 443 · * deny') + '</div>', a ? '✓ Reply allowed by outbound rule 110' : '✗ Reply dropped: stateless, the reply goes to port 50123 and no outbound rule allows it', a) + '</div>' +
      '<div class="figcap">' + (a ? 'After: one outbound rule for the client\u2019s ephemeral ports (1024-65535) lets replies out.' : 'Before: the request got in, but the NACL judges the reply as a separate packet.') + '</div>'; },
  // NACL rule order: lowest number first, first match wins
  awsnacl: sc => { const f = sc.fp; return '<div class="aw-req small">Packet: <b>' + _h(f.pkt) + '</b></div><table class="mini aw-rtab"><tr><th>Rule #</th><th>Traffic</th><th>Source</th><th>Action</th><th></th></tr>' +
      f.rules.map((r, i) => '<tr class="' + (i === f.hit ? 'aw-hl' : i > f.hit ? 'aw-skip' : '') + '"><td>' + r[0] + '</td><td>' + _h(r[1]) + '</td><td>' + _h(r[2]) + '</td><td>' + r[3] + '</td><td class="small">' + (i < f.hit ? 'no match' : i === f.hit ? '◀ first match: applied' : 'not checked') + '</td></tr>').join('') + '</table>' +
      '<div class="figcap">Rules are checked from the <b>lowest number</b> up. The first rule that matches decides; later rules are not checked.</div>'; },
  // peering is one-to-one and not transitive
  awspeer: () => '<div class="aw-peer"><div class="aw-vb">VPC B<br><small>10.1.0.0/16</small></div><div class="aw-pl ok">⇄ peered</div><div class="aw-vb hub">VPC A<br><small>10.0.0.0/16</small></div><div class="aw-pl ok">⇄ peered</div><div class="aw-vb">VPC C<br><small>10.2.0.0/16</small></div></div>' +
    '<div class="aw-res bad center">✗ B → A → C is not forwarded. B and C need their own peering (or a transit gateway).</div>' +
    '<div class="figcap">Each peering joins exactly two VPCs whose CIDR blocks do not overlap. Each side adds a route to the other\u2019s CIDR.</div>',
  // DNS → Route 53 → CloudFront edge → origin
  awsdns: () => AWX.hops([['🧑‍💻', 'Browser asks: what is the address of shop.example.com?', 'a DNS resolver answers from its cache (for the record\u2019s TTL) or asks onward'],
      ['📒', 'Route 53 hosted zone example.com', 'holds the records: A (name → IPv4), AAAA (→ IPv6), CNAME (name → another name), MX, TXT, and Route 53 alias records; here shop is an alias of d111.cloudfront.net'],
      ['📍', 'CloudFront edge location near the user', 'cache hit: the file is served from the edge'],
      ['🪣', 'Origin: S3 bucket or load balancer in one Region', 'only on a cache miss (or an expired copy) does the edge fetch from the origin']]) +
    '<div class="figcap">Route 53 answers <b>where</b> (DNS). CloudFront answers <b>from how close</b> (a cache at the edge). They are separate services, often used together.</div>',
  // three ways from a private subnet to S3
  awsep: sc => { const m = (sc.fp && sc.fp.hl) || ''; const row = (k, t, path, note) => '<div class="aw-opt' + (m === k ? ' on' : '') + '"><b>' + t + '</b><div class="small">' + path + '</div><div class="small muted">' + note + '</div></div>';
    return '<div class="aw-opts">' + row('nat', '① Through a NAT gateway', 'private subnet → NAT gateway (public subnet) → internet gateway → S3 public endpoint', 'Works, but you pay NAT data processing per GB, and the subnet gets general internet egress.') +
      row('gw', '② Gateway endpoint (S3 and DynamoDB only)', 'private subnet → route-table entry <code>pl-… → vpce-…</code> → S3', 'No internet gateway or NAT needed; no extra charge. Not part of PrivateLink. Same Region only.') +
      row('if', '③ Interface endpoint (AWS PrivateLink)', 'private subnet → an endpoint network interface with a private IP in your subnet → the service', 'For many services (S3 too, and e.g. Secrets Manager, KMS, Glue). Billed per hour and per GB. Uses security groups.') + '</div>'; },
  // users, groups, roles
  iamwho: () => '<div class="aw-lanes"><div class="aw-lane"><div class="aw-lab">👥 Group <code>data-engineers</code></div><div class="small">policy attached to the group</div><div class="aw-chips"><span class="chip">👤 user Ada</span><span class="chip">👤 user Bola</span></div><div class="small muted">Users have long-term credentials (password, access keys). A group only attaches policies to many users; it cannot sign in and is not a principal.</div></div>' +
    '<div class="aw-lane"><div class="aw-lab">🎭 Role <code>glue-etl-role</code></div><div class="small"><b>Trust policy:</b> who may assume it: <code>glue.amazonaws.com</code><br><b>Permissions policy:</b> what it may do</div><div class="aw-chips"><span class="chip">⚙️ Glue job assumes it</span><span class="chip">⏳ temporary credentials (STS)</span></div><div class="small muted">No password, no long-term keys. Services, apps and people assume a role and get credentials that expire.</div></div></div>',
  // anatomy of one policy statement
  iampol: sc => AWX.pol(sc.fp.json, sc.fp.cap) + '<div class="aw-keys small"><span class="aw-k aw-k-Effect">Effect</span> Allow or Deny · <span class="aw-k aw-k-Action">Action</span> which API calls (service:Operation) · <span class="aw-k aw-k-Resource">Resource</span> which ARNs · <span class="aw-k aw-k-Condition">Condition</span> only when this is true (optional) · <span class="aw-k aw-k-Principal">Principal</span> who: only in resource-based policies</div>',
  // policy evaluation in one account (identity-based + resource-based policies)
  iameval: sc => { const h = (sc.fp && sc.fp.hit) || ''; const n = (k, t, c) => '<div class="aw-node ' + c + (k && h === k ? ' aw-hit' : '') + '">' + t + '</div>';
    return '<div class="aw-flow">' + n('', '📨 Request: principal + action + resource + context (HTTPS? MFA?)', 'start') + '<div class="aw-down">↓</div>' +
      n('', '① Does any applicable policy have a matching <b>Deny</b>?', 'ask') + '<div class="aw-br"><span>yes →</span>' + n('deny', '⛔ <b>Explicit deny</b>: final, no Allow can override it', 'bad') + '</div><div class="aw-down">↓ no</div>' +
      n('', '② Does an identity-based <b>or</b> a resource-based policy have a matching <b>Allow</b>?', 'ask') + '<div class="aw-br"><span>yes →</span>' + n('allow', '✅ <b>Allowed</b>', 'ok') + '</div><div class="aw-down">↓ no</div>' +
      n('implicit', '⛔ <b>Implicit deny</b>: the default when nothing allows it', 'bad') + '</div>' +
      '<div class="figcap">This is the rule inside <b>one account</b> for identity-based and resource-based policies. SCPs, RCPs, permissions boundaries and session policies can only narrow it further, and a <b>cross-account</b> request needs an Allow on both sides.</div>'; },
  // the Glue job: trust policy + permissions policy + bucket policy (+ Lake Formation)
  iamglue: () => '<div class="aw-lanes"><div class="aw-lane"><div class="aw-lab">1 · Trust policy on the role</div><div class="small">Principal <code>{"Service": "glue.amazonaws.com"}</code> may call <code>sts:AssumeRole</code></div></div>' +
    '<div class="aw-lane"><div class="aw-lab">2 · Permissions policy on the role</div><div class="small">Allow <code>s3:GetObject</code> on <code>arn:aws:s3:::de-raw/sales/*</code></div></div>' +
    '<div class="aw-lane"><div class="aw-lab">3 · Bucket policy on de-raw</div><div class="small">Deny everything when <code>aws:SecureTransport</code> is false (plain HTTP)</div></div>' +
    '<div class="aw-lane"><div class="aw-lab">4 · If the table is governed by Lake Formation</div><div class="small">also a Lake Formation grant on the table or its columns</div></div></div>' +
    '<div class="figcap">The job reads an object only if nothing denies it and the role\u2019s Allow matches the object ARN.</div>',
  // envelope encryption as used by SSE-KMS
  kmsenv: () => AWX.hops([['🔑', 'KMS key (stays inside AWS KMS)', 'S3 calls GenerateDataKey: KMS returns a plaintext data key and the same data key encrypted under the KMS key'],
      ['📦', 'S3 encrypts the object with the plaintext data key', 'then removes the plaintext data key from memory'],
      ['🗄', 'Stored: encrypted object + encrypted data key (as metadata)', 'the encrypted data key is useless without the KMS key'],
      ['🔓', 'Reading: S3 sends the encrypted data key to KMS (Decrypt)', 'so the reader needs kms:Decrypt on the key as well as s3:GetObject']]),
  // salting is password hashing, not encryption
  salt: () => '<table class="mini aw-rtab"><tr><th>User</th><th>Password</th><th>Salt (random, stored)</th><th>Stored hash</th></tr><tr><td>ada</td><td>sunshine1</td><td>x7Qp</td><td>9f2c…</td></tr><tr><td>bola</td><td>sunshine1</td><td>M2b9</td><td>e41a…</td></tr></table>' +
    '<div class="aw-lanes"><div class="aw-lane"><div class="aw-lab"># Hashing (passwords)</div><div class="small">one-way: a login is checked by hashing again and comparing. The salt is <b>not secret</b>; it makes equal passwords give different hashes.</div></div>' +
    '<div class="aw-lane"><div class="aw-lab">🔐 Encryption (KMS)</div><div class="small">two-way: whoever may use the key can decrypt. You manage keys and who may use them; no KMS setting asks you for a salt.</div></div></div>',
  // the protection services
  awssec: () => '<div class="aw-opts">' + [['🔎 Amazon Macie', 'finds sensitive data (PII, financial data, credentials) in S3 objects and flags risky buckets, e.g. public ones'],
      ['🗝 Secrets Manager', 'stores secrets such as database passwords and can rotate them automatically'],
      ['🧾 SSM Parameter Store', 'stores configuration and secure strings; no automatic rotation of its own'],
      ['🧰 AWS WAF', 'a web ACL filters HTTP(S) requests (SQL injection, bad IPs, rate limits) for CloudFront, load balancers, API Gateway and more'],
      ['🛡 Shield Standard', 'automatic, no extra charge: protection against common network and transport layer DDoS attacks'],
      ['🛡 Shield Advanced', 'paid: expanded DDoS protection for resources you add, the Shield Response Team, and standard WAF fees for those resources included']].map(x => '<div class="aw-opt"><b>' + x[0] + '</b><div class="small">' + x[1] + '</div></div>').join('') + '</div>'
});
const AWS_PATH_OUT = [['🖥', 'Instance in private subnet 10.0.2.0/24', 'sends a request to the internet (say, a package mirror)'], ['🛡', 'Security group: outbound rules', 'the default outbound rule allows all'], ['🧱', 'Network ACL of the private subnet: outbound', 'checked by rule number'],
  ['🧭', 'Private route table', '0.0.0.0/0 → nat-gw (the NAT gateway in the public subnet of the same AZ)', 'aw-key'], ['🔁', 'NAT gateway', 'replaces the private source address with its own and remembers the connection'], ['🧭', 'Public route table', '0.0.0.0/0 → igw', 'aw-key'], ['🌐', 'Internet gateway', 'maps the NAT gateway\u2019s address to its Elastic IP; out to the internet'],
  ['↩️', 'The reply comes back the same way', 'NAT translates it back to the instance. A new connection started from the internet has no entry, so it cannot get in.']];

/* AWS-CONTENT-BEGIN: Course 4 Module 1 "Networking and IAM", in Coursera's lesson order. Our own words,
   checked against AWS documentation. Each lesson: pictures first, then questions (every wrong option explained,
   transfer questions outside music), then theory with "Coursera says / precisely" notes, then terms.
   Every term has a MEMORY HOOK shown before its definition. Hook kinds (never one kind for all):
     origin   = a documented name origin (fact, with its source)
     image    = a vivid picture or story (a memory aid, not a fact)
     split    = a word split or sound-alike that reveals the job (a memory aid)
     contrast = a contrast pair that separates two look-alikes (a memory aid)
   j = the job, used by the name-recall drill (show the job, produce the name). */
const AWS_HOOKS = {};
const AWS_C4M1 = [];
const AWS_CT = [];
const CZ = (said, prec) => '<div class="aw-cz"><b>Coursera says:</b> ' + said + '<br><b>Precisely:</b> ' + prec + '</div>';
function AWL(l) {
  l.terms = (l.T || []).map(([id, term, def, t1, ph, t3, hook]) => {
    TERMS4[id] = { t1: { def: t1, ph: ph.map(p => ({ a: p[0], d: p[1], spot: p[2] })) }, t3 };
    AWS_HOOKS[id] = hook; return { id, term, def };
  });
  delete l.T;
  if (l.ill) { ILLUS[l.id] = l.ill; delete l.ill; }
  AWS_C4M1.push(l);
}

// ---------- Lesson 0 (added by DE Daily): network basics that Coursera assumes ----------
Object.assign(ILL_FIGS, {
  awsip: sc => { const f = sc.fp || {}; const g = ['00001010', '00000000', '00000001', '00000111']; let n = 0;
    const bits = g.map(x => x.split('').map(c => (n++ < (f.cut || 0)) ? '<b class="ok">' + c + '</b>' : c).join('')).join('.');
    return '<div class="aw-req"><b>10.0.1.7</b> = four numbers 0-255, each one is 8 bits:<br><code class="mono">' + bits + '</code></div>' +
      (f.cut ? '<div class="figcap"><b>/' + f.cut + '</b>: the first ' + f.cut + ' bits (green) are fixed for the whole block; the other ' + (32 - f.cut) + ' bits are free, so the block has 2<sup>' + (32 - f.cut) + '</sup> = ' + Math.pow(2, 32 - f.cut).toLocaleString('en') + ' addresses.</div>' : '<div class="figcap">An IPv4 address is 32 bits, written as four 8-bit numbers.</div>'); },
  awsport: () => '<div class="aw-lanes"><div class="aw-lane"><div class="aw-lab">🏢 One server, IP 10.0.1.10</div><div class="aw-chips"><span class="chip">door 22: SSH</span><span class="chip">door 53: DNS</span><span class="chip">door 443: HTTPS</span><span class="chip">door 5432: PostgreSQL</span><span class="chip">door 5439: Redshift</span></div></div></div>' +
    '<div class="figcap">The IP address picks the <b>machine</b>; the port picks the <b>program</b> on it. A connection is always address + port.</div>',
  awspriv: () => '<table class="mini aw-rtab"><tr><th>Private range (RFC 1918)</th><th>As CIDR</th></tr><tr><td>10.0.0.0 – 10.255.255.255</td><td>10.0.0.0/8</td></tr><tr><td>172.16.0.0 – 172.31.255.255</td><td>172.16.0.0/12</td></tr><tr><td>192.168.0.0 – 192.168.255.255</td><td>192.168.0.0/16</td></tr></table>' +
    '<div class="figcap">Private addresses are not routed on the public internet. Each private network can reuse them, so to reach the internet a device needs a public address or a NAT in between.</div>'
});
AWL({ id: 'aws0', title: 'Network basics: addresses, blocks and ports', cz: 'Added by DE Daily (Coursera assumes it)',
  ill: { tables: {}, scenes: [
    { h: 'An address is 32 bits', fig: 'awsip', fp: {}, say: 'Every device on a network has an IP address. In IPv4 it is 32 bits, written as four numbers from 0 to 255 joined by dots. Read 10.0.1.7 as four 8-bit groups.' },
    { h: 'A block of addresses: CIDR', fig: 'awsip', fp: { cut: 24 }, say: 'A CIDR block writes a whole range at once: an address, a slash, and how many leading bits are fixed. 10.0.1.0/24 fixes the first 24 bits, so only the last 8 vary: 256 addresses, 10.0.1.0 to 10.0.1.255.', note: 'Smaller number after the slash = bigger block. /16 has 65,536 addresses; /24 has 256.' },
    { h: 'Private ranges', fig: 'awspriv', say: 'Three ranges are reserved for private networks. Your VPC will use one of them, often 10.0.0.0/16.' },
    { h: 'Ports pick the program', fig: 'awsport', say: 'One machine runs several programs. The port number says which one a packet is for: 443 for HTTPS, 5432 for PostgreSQL, 5439 for Redshift.' }],
  qs: [
    { k: 'mc', ref: false, q: 'How many addresses does <code>10.0.0.0/16</code> hold?', o: ['65,536', '16', '256', '4,294,967,296'], w: [null, '16 is the number of FIXED bits, not the count of addresses.', '256 is a /24 (8 free bits). A /16 has 16 free bits.', 'That is all of IPv4 (/0).'], why: '32 − 16 = 16 free bits, and 2<sup>16</sup> = 65,536.' },
    { k: 'mc', ref: false, q: 'Which block is bigger?', o: ['10.0.0.0/16', '10.0.1.0/24', 'They are the same size', 'You cannot compare CIDR blocks'], w: [null, 'A /24 fixes MORE bits, so fewer are left free: 256 addresses.', '/16 = 65,536, /24 = 256.', 'You can: compare the number after the slash.'], why: 'The smaller the number after the slash, the fewer bits are fixed, the bigger the block.' },
    { k: 'mc', ref: false, q: 'A hospital laptop has address 192.168.4.20. What does that tell you?', o: ['It is a private address: not reachable directly from the internet', 'It is a public web server', 'It is an IPv6 address', 'It must be in AWS'], w: [null, '192.168.0.0/16 is a private range; public servers use public addresses.', 'IPv6 addresses are written in hex with colons, e.g. 2001:db8::1.', 'Private ranges are used in homes, offices and clouds alike.'], why: '192.168.x.x is inside the private range 192.168.0.0/16.' },
    { k: 'mc', ref: false, q: 'A bank app connects to its PostgreSQL database at 10.0.2.15. What else must it know?', o: ['The port, usually 5432', 'The subnet mask of the internet', 'The MAC address of the bank', 'Nothing: the IP is enough'], w: [null, 'There is no single mask for the internet; the app needs the database\u2019s port.', 'MAC addresses are for the local link, not chosen by the app.', 'The IP finds the machine; the port finds the program on it.'], why: 'A connection is address + port. PostgreSQL listens on 5432 by default.' },
    { k: 'cls', q: 'Private or public address?', cats: ['Private (RFC 1918)', 'Public'], items: [['10.20.30.40', 0], ['172.20.0.5', 0], ['172.32.0.5', 1], ['192.168.1.1', 0], ['8.8.8.8', 1]], why: 'Private: 10.0.0.0/8, 172.16.0.0/12 (172.16 to 172.31 only) and 192.168.0.0/16. 172.32.x.x is outside 172.16/12, so it is public.' }] },
  theory: { why: 'Every AWS networking lesson is written in addresses, blocks and ports. Coursera assumes you can read them, so we learn them first.',
    body: ['An <b>IPv4 address</b> is 32 bits written as four numbers 0-255 (10.0.1.7). A <b>CIDR block</b> names a range: address/prefix, where the prefix is how many leading bits are fixed. Free bits = 32 − prefix; size = 2 to that power.',
      'Three ranges are private (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. They are not routed on the internet, which is why AWS needs gateways and NAT to connect private networks to it.',
      'A <b>port</b> (0-65535) picks the program on a machine: 22 SSH, 53 DNS, 443 HTTPS, 5432 PostgreSQL, 5439 Redshift. A client uses a temporary high port (an <b>ephemeral port</b>) for its side of the connection, which matters for network ACLs later.'],
    pro: 'Our VPC is 10.0.0.0/16, carved into /24 subnets; Redshift listens on 5439.', q: { q: 'Why can two companies both use 10.0.0.0/16 without clashing?', a: 'Private ranges are not routed on the public internet, so each private network can reuse them. They only clash if the two networks are joined (e.g. VPC peering), which is why peered CIDRs must not overlap.' } },
  T: [
    ['aws0-cidr', 'CIDR block', 'A range of IP addresses written as [[address]] slash [[number of fixed bits]].',
      'A CIDR block is {a range of IP addresses} written as {an address, a slash and the number of fixed bits}.', [
      [['a range of addresses', 'a block of IP addresses'], [['one single IP address', 'A CIDR block is a RANGE; /32 is the special case of one address.'], ['a list of port numbers', 'Ports are not part of CIDR.'], ['a domain name', 'Names belong to DNS.']], { q: 'Which is a CIDR block?', o: ['10.0.1.0/24', '10.0.1.7:443', 'shop.example.com', 'eu-west-1'], why: '/24 marks the fixed bits of a range. :443 is a port, the others are a name and a Region.' }],
      [['address slash fixed bits', 'an address, a slash and the prefix length'], [['an address, a slash and the number of addresses', 'The number after the slash is fixed BITS, not the count: /24 holds 256, not 24.'], ['an address, a colon and a port', 'That is address:port.'], ['an address, a slash and the subnet name', 'Names are tags, not part of CIDR.']], { q: '10.0.0.0/16: what is the 16?', o: ['the number of fixed leading bits', 'the number of addresses', 'the number of subnets', 'the port'], why: '16 bits fixed, 16 free: 65,536 addresses.' }]],
      'CIDR (Classless Inter-Domain Routing, RFC 4632) replaced fixed class A/B/C sizes: any prefix length is allowed; size = 2^(32 − prefix); an AWS VPC IPv4 block is between /16 and /28.',
      { k: 'origin', t: '<b>CIDR = Classless Inter-Domain Routing</b> (RFC 4632). "Classless" because before it, networks came only in three fixed sizes (classes A, B, C). The slash lets you pick any size.', j: 'writes a range of IP addresses as address/number-of-fixed-bits' }],
    ['aws0-priv', 'Private IP range', 'An address range [[reserved for private networks]] and [[not routed on the internet]].',
      'A private IP range is {reserved for private networks} and {not routed on the public internet}.', [
      [['set aside for private networks', 'kept for private networks'], [['reserved for AWS only', 'Homes and offices use the same ranges; they are not AWS-specific.'], ['reserved for web servers', 'Public web servers need public addresses.'], ['reserved for IPv6', 'These are IPv4 ranges.']], { q: 'Which range is private?', o: ['172.16.0.0/12', '172.32.0.0/16', '8.8.8.0/24', '100.0.0.0/8'], why: 'Private: 10/8, 172.16/12, 192.168/16.' }],
      [['not routed on the internet', 'not reachable directly from the internet'], [['encrypted on the internet', 'Private is about routing, not encryption.'], ['faster on the internet', 'They are not routed there at all.'], ['blocked by every firewall', 'Firewalls are separate; the internet simply does not route them.']], { q: 'An instance has only 10.0.2.9. Can a user on the internet open a connection to it?', o: ['No: a private address is not routed on the internet', 'Yes, on port 443', 'Yes, if it has a DNS name', 'Only at night'], why: 'Without a public address (or a load balancer/NAT in front) the internet has no route to it.' }]],
      'RFC 1918 ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16; reaching the internet needs NAT or a public IP; overlapping private ranges block peering.',
      { k: 'image', t: 'Memory aid: <b>a private house number</b>. "Flat 10" exists in thousands of buildings, so the post office cannot deliver to "Flat 10" alone. Private addresses are like that: reused everywhere, so the internet cannot deliver to them.', j: 'an address range reused inside private networks and not routed on the internet' }],
    ['aws0-region', 'Region', 'A [[geographic area]] of AWS with [[several Availability Zones]].',
      'A Region is {a separate geographic area of AWS} containing {several Availability Zones}.', [
      [['a geographic area of AWS', 'a separate geographic area'], [['one data centre', 'That is smaller than an AZ.'], ['a country\u2019s whole internet', 'Regions are AWS locations, not countries\u2019 networks.'], ['an edge location', 'Edge locations are CloudFront/Route 53 sites, far more numerous.']], { q: 'Which is a Region code?', o: ['eu-west-1', 'eu-west-1a', '10.0.0.0/16', 'arn:aws:s3:::x'], why: 'eu-west-1 is Ireland; the trailing letter (eu-west-1a) marks an AZ.' }],
      [['several Availability Zones', 'multiple AZs'], [['one Availability Zone', 'Regions have at least three AZs today.'], ['several VPCs only', 'You create VPCs; AZs are AWS\u2019s physical structure.'], ['several edge locations', 'Edge locations are separate from Regions.']], { q: 'An app must survive one data-centre fire. Minimum design?', o: ['run in two AZs of one Region', 'run in one AZ', 'buy a bigger instance', 'use two subnets in one AZ'], why: 'AZs are isolated from each other\u2019s failures.' }]],
      'Each Region is isolated from others (data stays unless you copy it); most services are regional; codes like af-south-1 (Cape Town), eu-west-1 (Ireland), us-east-1 (N. Virginia).',
      { k: 'image', t: 'Memory aid: <b>a Region is a city</b>, and its <b>Availability Zones are separate districts</b> with their own power and water. A fire in one district does not stop the others.', j: 'a separate geographic area of AWS containing several Availability Zones' }],
    ['aws0-az', 'Availability Zone', '[[One or more separate data centres]] [[inside a Region]].',
      'An Availability Zone is {one or more separate data centres} {inside one Region}.', [
      [['one or more separate data centres', 'one or more isolated data centres'], [['one single server rack', 'An AZ is whole data centres, with their own power and networking.'], ['a whole continent', 'That is far bigger than a Region.'], ['a virtual network', 'That is a VPC.']], { q: 'eu-west-1b is…', o: ['an Availability Zone of eu-west-1', 'a Region', 'a subnet', 'a VPC'], why: 'Region code + letter = AZ.' }],
      [['inside one Region', 'within a Region'], [['spread across Regions', 'An AZ belongs to exactly one Region.'], ['inside one VPC', 'VPCs span AZs, not the other way round.'], ['at an edge location', 'Edge locations are separate sites.']], { q: 'A subnet in us-east-1a can be used by a VPC in…', o: ['us-east-1 only', 'any Region', 'us-west-1', 'eu-west-1'], why: 'The AZ lives in us-east-1.' }]],
      'AZs are physically separate (distinct power, cooling, networking) but linked with low-latency links; a subnet lives in exactly one AZ; letters map to physical AZs differently per account (AZ IDs like use1-az1 are fixed).',
      { k: 'split', t: 'Memory aid: <b>Availability Zone</b> = a zone that keeps your app <b>available</b> when another zone fails. Two zones = two chances.', j: 'one or more separate data centres inside a Region' }],
    ['aws0-port', 'Port', 'A number [[0 to 65535]] that picks [[which program on a machine]].',
      'A port is {a number from 0 to 65535} that picks {which program on the machine} receives the traffic.', [
      [['a number 0-65535', 'a 16-bit number'], [['a number from 0 to 255', 'That is one part of an IPv4 address. Ports go up to 65535.'], ['a cable socket', 'Here a port is a number, not a physical socket.'], ['an IP address', 'The address picks the machine; the port is separate.']], { q: 'In 10.0.1.10:5439, which part is the port?', o: ['5439', '10.0.1.10', '10', 'the colon'], why: 'address:port. 5439 is Redshift\u2019s default port.' }],
      [['which program on the machine', 'which service on the host'], [['which machine on the network', 'That is the job of the IP address.'], ['which user is logged in', 'Ports know nothing about users.'], ['which Region', 'Regions are AWS geography.']], { q: 'One server runs a website (443) and SSH (22). A packet arrives for port 22. Who gets it?', o: ['the SSH program', 'the website', 'both', 'nobody: one server has one port'], why: 'The port picks the program.' }]],
      'TCP and UDP each have 65,536 ports; well-known ports are 0-1023 (22 SSH, 53 DNS, 443 HTTPS); clients use temporary ephemeral ports (Linux 32768-60999, AWS docs suggest allowing 1024-65535 in NACLs).',
      { k: 'image', t: 'Memory aid: <b>a harbour</b> (sea port). The IP address is the harbour town; the port number is the numbered dock where one particular ship (program) ties up.', j: 'a number that picks which program on a machine gets the traffic' }]],
  qa: [{ id: 'aws0-q1', q: 'How many addresses are in a /28?', a: '32 − 28 = 4 free bits, so 2⁴ = 16. (In an AWS subnet, 5 of them are reserved, leaving 11 usable.)' },
    { id: 'aws0-q2', q: 'Which ports: HTTPS, DNS, PostgreSQL, Redshift?', a: '443, 53, 5432, 5439.' },
    { id: 'aws0-q3', q: 'Why must an ephemeral port range be allowed in some firewall rules?', a: 'The client side of a connection uses a temporary high port; replies go back to it. A stateless filter (a NACL) must allow those ports for replies.' }],
  problems: [{ id: 'aws0-p1', kind: 'open', title: 'Carve a network for a school', scenario: 'A school gets 10.0.0.0/16 and wants four equal /24 networks for admin, teachers, students and cameras. Write the four blocks and the size of each.', hint: 'Change the third number.', solution: '10.0.0.0/24, 10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24: 256 addresses each.', explain: 'A /24 fixes the first three numbers; stepping the third number gives non-overlapping blocks inside the /16.' }]
});

// ---------- Lesson 1 = Coursera 02 "Amazon VPC" ----------
AWL({ id: 'aws1', title: 'Amazon VPC: your private network in AWS', cz: 'Amazon VPC',
  ill: { tables: {}, scenes: [
    { h: 'Region → VPC → Availability Zones → subnets', fig: 'awsvpc', fp: {}, say: 'A VPC lives in one Region and spans all its Availability Zones. You give it a CIDR block (here 10.0.0.0/16). A subnet is a smaller block inside it, and each subnet sits in exactly one AZ.', note: 'AWS reserves 5 addresses in every subnet: the first four and the last one. A /24 subnet has 256 − 5 = 251 usable.' },
    { h: 'Public vs private is decided by the route table', fig: 'awsvpc', fp: { hl: 'pub' }, say: 'A subnet is "public" only because its route table sends 0.0.0.0/0 (everything not local) to the internet gateway. Nothing else makes it public.' },
    { h: 'A private subnet reaches out through NAT', fig: 'awspath', fp: AWS_PATH_OUT, say: 'An instance in the private subnet sends traffic to the internet: route table → NAT gateway in a public subnet → internet gateway. Replies come back; new connections from the internet cannot start.' },
    { h: 'Security group vs network ACL', fig: 'awssgnacl', fp: {}, say: 'A security group sits on the network interface and is stateful: an allowed request\u2019s reply is allowed automatically. A network ACL sits on the subnet and is stateless: replies are judged again.' },
    { h: 'Fixing the NACL', fig: 'awssgnacl', fp: { after: true }, say: 'With a stateless NACL you must allow replies yourself: outbound to the client\u2019s ephemeral ports.' },
    { h: 'NACL rules: lowest number first', fig: 'awsnacl', fp: { pkt: 'TCP 22 from 198.51.100.7', rules: [[100, 'TCP 443', '0.0.0.0/0', 'ALLOW'], [110, 'TCP 22', '198.51.100.0/24', 'DENY'], [120, 'TCP 22', '0.0.0.0/0', 'ALLOW'], ['*', 'All', '0.0.0.0/0', 'DENY']], hit: 1 }, say: 'Rule 110 matches first and denies. Rule 120 would allow, but it is never checked.' }],
  qs: [
    { k: 'mc', ref: false, q: 'What makes a subnet <b>public</b>?', o: ['Its route table has 0.0.0.0/0 → internet gateway', 'Its name contains "public"', 'It has a NAT gateway route', 'Its security group allows 0.0.0.0/0'], w: [null, 'Names are labels; AWS ignores them.', 'A NAT route makes it a private subnet with outbound access.', 'Security groups filter; they do not create a path to the internet.'], why: 'The route to an internet gateway is the definition. Instances also need a public IP to be reached.' },
    { k: 'mc', ref: false, q: 'A <code>10.0.2.0/24</code> subnet: how many addresses can you give to resources?', o: ['251', '256', '254', '255'], w: [null, 'AWS reserves 5 of the 256.', '254 is the classic network rule; AWS reserves one more for its DNS and one for future use.', 'Still 4 short.'], why: 'AWS reserves .0 (network), .1 (VPC router), .2 (DNS), .3 (future) and .255 (broadcast, not supported).' },
    { k: 'mc', ref: false, q: 'A Glue job in a private subnet must download a library from the internet. What does its route table need?', o: ['0.0.0.0/0 → a NAT gateway in a public subnet', '0.0.0.0/0 → the internet gateway', 'nothing: private subnets reach the internet', 'a security group rule only'], w: [null, 'Then the subnet would be public and the job would need a public IP.', 'Without a route there is no path out.', 'Filters cannot create a path.'], why: 'NAT gives outbound-only internet access to private resources.' },
    { k: 'mc', ref: false, q: 'A shop\u2019s web server allows inbound TCP 443 in its <b>security group</b>. Must you add an outbound rule for the reply?', o: ['No: security groups are stateful', 'Yes, for ports 1024-65535', 'Yes, for port 443 outbound', 'Only if the NACL is default'], w: [null, 'That is what a stateless NACL needs, not a security group.', 'The reply goes to the client\u2019s ephemeral port, and a SG does not need a rule for it anyway.', 'The NACL is separate; SG statefulness does not depend on it.'], why: 'A security group tracks the connection, so the reply to an allowed request is allowed.' },
    { k: 'mc', ref: false, q: 'Which can <b>deny</b> a specific IP address?', o: ['A network ACL', 'A security group', 'Both', 'Neither'], w: [null, 'Security groups have only allow rules.', 'Only NACLs have deny rules.', 'NACLs can.'], why: 'To block one bad IP at the subnet, add a numbered DENY rule to the NACL.' },
    { k: 'cls', q: 'Security group or network ACL?', cats: ['Security group', 'Network ACL'], items: [['stateful', 0], ['stateless', 1], ['allow rules only', 0], ['numbered rules, first match wins', 1], ['attached to a network interface', 0], ['attached to a subnet', 1]], why: 'SG: interface level, stateful, allow-only, all rules evaluated together. NACL: subnet level, stateless, allow and deny, by number.' }] },
  theory: { why: 'Data pipelines run inside networks. Glue, EMR, Redshift and RDS sit in subnets, and most "connection timed out" errors are a route table, a security group or a NACL.',
    body: ['A <b>VPC</b> is a logically isolated network in one Region, with a CIDR block you choose (IPv4 between /16 and /28). A <b>subnet</b> is a range of it in <b>one Availability Zone</b>. Each subnet uses a <b>route table</b>; if you do not associate one, it uses the VPC\u2019s main route table.',
      'An <b>internet gateway</b> attaches to the VPC. A subnet whose route table sends 0.0.0.0/0 to it is public. A <b>NAT gateway</b> lives in a public subnet and lets private subnets start connections out, never in.',
      '<b>Security groups</b> (stateful, allow only, on the interface) and <b>network ACLs</b> (stateless, allow and deny, numbered, on the subnet) both filter traffic. The default security group allows inbound only from members of the same group and all outbound; the default NACL allows everything.',
      CZ('an example block written as "10.0.0.1.0/24".', 'that is five numbers, not a valid IPv4 address. A subnet block looks like 10.0.1.0/24.') +
      CZ('a VPC in "N. California" with the AZ "us-east-1a".', 'N. California is us-west-1; us-east-1a is in N. Virginia. AZ names start with their Region code.') +
      CZ('route table entries with a destination and a "source".', 'a route has a destination (a CIDR) and a <b>target</b> (where to send it: local, igw-…, nat-…).') +
      CZ('security groups are stateful, so allowing inbound traffic automatically allows outgoing traffic.', 'only the <b>return traffic of an allowed connection</b> is allowed. A new connection the server starts follows the outbound rules.')],
    pro: 'Glue runs in the private subnets; S3 goes through a gateway endpoint and the internet through a NAT gateway per AZ.', q: { q: 'Why one NAT gateway per AZ instead of one for the VPC?', a: 'A NAT gateway lives in one AZ. If that AZ fails, private subnets elsewhere lose internet access, and cross-AZ traffic costs extra. One per AZ keeps each AZ independent.' } },
  T: [
    ['aws1-vpc', 'VPC', 'A [[logically isolated network]] in [[one Region]] with your own IP range.',
      'A VPC is {a logically isolated virtual network} in {one AWS Region}.', [
      [['a logically isolated network', 'an isolated virtual network'], [['a physical data centre', 'It is virtual: one VPC spans several AZs, each of which is one or more data centres.'], ['a single server', 'A VPC holds many resources.'], ['a public network shared by all accounts', 'It is isolated from other networks unless you connect it.']], { q: 'Which is true of a VPC?', o: ['it spans all AZs of its Region', 'it spans all Regions', 'it lives in one AZ', 'it is a type of subnet'], why: 'VPC = Region-wide; subnet = one AZ.' }],
      [['one AWS Region', 'a single Region'], [['one Availability Zone', 'That is a subnet. A VPC spans all AZs of its Region.'], ['every Region', 'A VPC is regional; connecting Regions needs peering or a transit gateway.'], ['one edge location', 'Edge locations belong to CloudFront.']], { q: 'A team needs networks in eu-west-1 and us-east-1. How many VPCs at least?', o: ['two', 'one', 'zero', 'one per subnet'], why: 'One VPC belongs to one Region.' }]],
      'You pick its IPv4 CIDR (/16 to /28) and can add secondary blocks and IPv6; it spans every AZ of the Region; it is free, but NAT gateways, endpoints and data transfer cost.',
      { k: 'split', t: 'Memory aid: <b>V-P-C = Virtual Private Cloud</b>. Virtual (software, no cables of yours), Private (isolated), Cloud (in AWS). Picture a fenced estate drawn on AWS\u2019s land.', j: 'a logically isolated virtual network in one Region' }],
    ['aws1-subnet', 'Subnet', 'A [[range of the VPC\u2019s addresses]] in [[exactly one Availability Zone]].',
      'A subnet is {a range of the VPC\u2019s IP addresses} in {exactly one Availability Zone}.', [
      [['a range of the VPC addresses', 'a smaller block of the VPC\u2019s range'], [['a copy of the VPC', 'It is a part of the VPC range, not a copy.'], ['a group of VPCs', 'It is smaller than a VPC, not bigger.'], ['a list of security rules', 'Rules are security groups and NACLs.']], { q: 'VPC 10.0.0.0/16. Which can be one of its subnets?', o: ['10.0.5.0/24', '10.1.5.0/24', '192.168.0.0/24', '10.0.0.0/8'], why: 'A subnet must lie inside the VPC range. 10.0.0.0/8 is bigger than the VPC.' }],
      [['exactly one Availability Zone', 'a single AZ'], [['several Availability Zones', 'One subnet never spans AZs. Use one subnet per AZ for high availability.'], ['every Region', 'Subnets are inside a VPC, inside one Region.'], ['one edge location', 'Not related to CloudFront.']], { q: 'For a database that survives an AZ failure you need…', o: ['subnets in at least two AZs', 'one big subnet', 'one subnet and two VPCs', 'a public subnet'], why: 'Each subnet is in one AZ, so two AZs need two subnets.' }]],
      'Public or private is decided by its route table, not its name; AWS reserves 5 addresses per subnet; it is associated with exactly one route table (the main one by default) and one NACL.',
      { k: 'split', t: 'Memory aid: <b>sub-net = a net under the net</b>, like a sub-division of a housing estate: one street (subnet) in one district (AZ).', j: 'a range of the VPC\u2019s addresses in exactly one Availability Zone' }],
    ['aws1-rt', 'Route table', 'Rules that say [[where to send traffic]] for each [[destination range]].',
      'A route table is {a set of routes}, each sending {a destination range to a target}.', [
      [['a set of routes', 'a list of routes'], [['a set of firewall rules', 'Route tables do not allow or deny; they choose the path.'], ['a list of IP addresses in use', 'That is not what it stores.'], ['a DNS zone', 'DNS records live in hosted zones.']], { q: 'Traffic to S3 times out from a private subnet with a correct security group. Where do you look first?', o: ['the subnet\u2019s route table', 'the bucket name', 'the IAM user\u2019s password', 'CloudFront'], why: 'Without a route (NAT or an S3 endpoint), packets have no path.' }],
      [['a destination range to a target', 'a destination CIDR to a target'], [['a source range to a target', 'Routes use the DESTINATION. Coursera calls it "source" once; that is a slip.'], ['a target to a port', 'Ports are not in routes.'], ['a user to a policy', 'That is IAM.']], { q: 'Route <code>0.0.0.0/0 → nat-0ab</code>. What does it mean?', o: ['send every non-local destination to the NAT gateway', 'allow all traffic', 'block all traffic', 'traffic from anywhere comes from NAT'], why: '0.0.0.0/0 is the catch-all destination; the most specific match wins, so local traffic still goes local.' }]],
      'The longest-prefix (most specific) route wins; every table has the local route for the VPC CIDR; one subnet uses one table, one table can serve many subnets.',
      { k: 'image', t: 'Memory aid: <b>a signpost at the estate gate</b>. "Lagos (10.0.0.0/16): stay inside. Everywhere else (0.0.0.0/0): take the NAT road." It points; it never checks passports.', j: 'routes that send each destination range to a target' }],
    ['aws1-igw', 'Internet gateway', 'A VPC component that [[connects the VPC to the internet]] for public subnets.',
      'An internet gateway {is attached to a VPC} and {connects it to the internet}.', [
      [['is attached to a VPC', 'attaches to the VPC'], [['is attached to one subnet', 'It attaches to the VPC; subnets use it through their route tables.'], ['is attached to one instance', 'Instances use it through routes and a public IP.'], ['runs in one AZ', 'It is a horizontally scaled VPC-level component, not tied to an AZ.']], { q: 'How many internet gateways can one VPC have attached?', o: ['one', 'one per subnet', 'one per AZ', 'unlimited'], why: 'One IGW per VPC.' }],
      [['connects it to the internet', 'lets it reach the internet'], [['connects it to another VPC', 'That is peering or a transit gateway.'], ['encrypts all its traffic', 'IGWs do not encrypt.'], ['hides its private addresses', 'For instances with public IPs it maps them; NAT is the hiding tool for private subnets.']], { q: 'Which route makes a subnet public?', o: ['0.0.0.0/0 → igw-…', '0.0.0.0/0 → nat-…', '10.0.0.0/16 → local', 'pl-… → vpce-…'], why: 'A route to the IGW.' }]],
      'It is redundant and scaled by AWS, free itself; it does one-to-one NAT for instances with public IPv4 addresses; IPv6 outbound-only access uses an egress-only internet gateway.',
      { k: 'contrast', t: 'Contrast pair: <b>internet gateway = a two-way front door</b> (people come in and go out, if they have a public address). <b>NAT gateway = a one-way exit</b> (you can go out and get the reply, nobody starts a visit in).', j: 'attached to a VPC, it connects the VPC to the internet both ways' }],
    ['aws1-nat', 'NAT gateway', 'Lets [[private-subnet resources start outbound connections]] while [[blocking connections started from outside]].',
      'A NAT gateway lets {private resources start connections out} but {never lets the internet start connections in}.', [
      [['private resources start connections out', 'private subnets reach out'], [['public resources accept connections in', 'That is the internet gateway plus a public IP.'], ['private resources talk to each other', 'The local route already does that.'], ['users log in to AWS', 'That is IAM.']], { q: 'A Lambda in a private subnet calls a weather API on the internet. Which route?', o: ['0.0.0.0/0 → nat-…', '0.0.0.0/0 → igw-…', 'none', 'pl-… → vpce-…'], why: 'Private + outbound = NAT.' }],
      [['never lets the internet start connections in', 'blocks connections started from outside'], [['blocks all replies', 'Replies to outbound connections come back fine.'], ['lets everyone in on 443', 'NAT never accepts new inbound connections.'], ['encrypts everything', 'NAT does address translation, not encryption.']], { q: 'Can a user on the internet SSH into an instance behind a NAT gateway?', o: ['No', 'Yes, on port 22', 'Yes, with a key pair', 'Only via the NAT\u2019s IP'], why: 'NAT has no entry for unsolicited inbound connections.' }]],
      'It lives in one public subnet (one AZ), needs an Elastic IP for public NAT, and costs per hour plus per GB processed; for S3/DynamoDB traffic a free gateway endpoint avoids that charge.',
      { k: 'origin', t: '<b>NAT = Network Address Translation</b>: it translates (rewrites) the private source address into its own public one on the way out, and back on the way in.', j: 'lets private resources start connections out, never lets the internet start them in' }],
    ['aws1-sg', 'Security group', 'A [[stateful]] firewall with [[allow rules only]] on a network interface.',
      'A security group is {a stateful firewall} with {allow rules only}, attached to {a network interface}.', [
      [['a stateful firewall', 'a stateful virtual firewall'], [['a stateless firewall', 'That is a network ACL. A security group remembers connections.'], ['a route table', 'It filters; it does not choose paths.'], ['an IAM policy', 'IAM controls API actions, not packets.']], { q: 'A SG allows inbound 5439 (Redshift) from the BI tool. The reply to the BI tool needs…', o: ['nothing more', 'an outbound rule to 1024-65535', 'a NACL change', 'a NAT gateway'], why: 'Stateful: the reply to an allowed request is allowed.' }],
      [['allow rules only', 'only allow rules'], [['allow and deny rules', 'Only NACLs have deny. In a SG, anything not allowed is dropped.'], ['deny rules only', 'SGs have no deny rules.'], ['numbered rules', 'NACL rules are numbered; SG rules are all evaluated together.']], { q: 'How do you block one bad IP but allow everyone else on 443 with a security group alone?', o: ['you cannot: use a NACL deny rule', 'add a deny rule', 'give the rule a low number', 'remove the outbound rule'], why: 'SGs cannot deny.' }],
      [['a network interface', 'an ENI'], [['a subnet', 'NACLs attach to subnets.'], ['a VPC', 'A SG belongs to a VPC but attaches to interfaces.'], ['an IAM user', 'Not IAM.']], { q: 'Two instances in the same subnet: can they have different security groups?', o: ['yes', 'no', 'only in different AZs', 'only with a NACL'], why: 'SGs are per interface, so per instance.' }]],
      'A rule can reference another security group as the source; the default SG allows inbound from its own members and all outbound; new SGs allow all outbound, no inbound.',
      { k: 'contrast', t: 'Contrast pair: <b>SG = a bouncer with a memory</b>. He let you in, so he lets you out. <b>NACL = a turnstile</b> that checks every crossing, in and out, by its numbered list.', j: 'a stateful, allow-only firewall on a network interface' }],
    ['aws1-nacl', 'Network ACL', 'A [[stateless]] subnet filter with [[numbered allow and deny rules]].',
      'A network ACL is {a stateless filter on a subnet} with {numbered allow and deny rules}.', [
      [['a stateless filter on a subnet', 'a stateless subnet firewall'], [['a stateful filter on a subnet', 'NACLs are stateless: replies are checked again.'], ['a stateless filter on an instance', 'It attaches to subnets.'], ['a route table', 'It filters, it does not route.']], { q: 'A NACL allows inbound 443 only and outbound 443 only. HTTPS replies fail. Why?', o: ['replies go to the client\u2019s ephemeral port, which outbound does not allow', 'the SG is stateless', 'NACLs cannot allow 443', 'the route table is wrong'], why: 'Stateless: allow outbound 1024-65535.' }],
      [['numbered allow and deny rules', 'numbered rules that allow or deny'], [['unnumbered allow rules', 'That is closer to a security group.'], ['deny rules only', 'NACLs allow and deny.'], ['rules all checked together', 'Lowest number first; first match wins.']], { q: 'Rule 100 ALLOW all, rule 90 DENY 203.0.113.5. Traffic from 203.0.113.5?', o: ['denied: 90 is checked first', 'allowed: 100 allows all', 'both apply', 'random'], why: 'Lowest number first.' }]],
      'Each subnet has exactly one NACL (the default allows all in and out); a custom NACL denies all until you add rules; the * rule is the final deny.',
      { k: 'split', t: 'Memory aid: <b>N-ACL = Network Access Control List</b>, and stress the <b>List</b>: a numbered list, read from the top (lowest number), stopping at the first match.', j: 'a stateless subnet filter with numbered allow and deny rules' }]],
  qa: [{ id: 'aws1-q1', q: 'Name the five reserved addresses of 10.0.1.0/24.', a: '10.0.1.0 network, .1 VPC router, .2 Amazon DNS, .3 reserved for future use, .255 broadcast (not supported, so reserved).' },
    { id: 'aws1-q2', q: 'What two things must be true for an instance to be reachable from the internet?', a: 'Its subnet routes 0.0.0.0/0 to an internet gateway, and it has a public IP (or Elastic IP). Then SG and NACL must allow the traffic.' },
    { id: 'aws1-q3', q: 'SG vs NACL in one line each.', a: 'SG: interface, stateful, allow-only, all rules evaluated. NACL: subnet, stateless, allow+deny, numbered, first match wins.' }],
  problems: [{ id: 'aws1-p1', kind: 'open', title: 'Why does the clinic\u2019s job time out?', scenario: 'A clinic runs a nightly export on an instance in subnet 10.0.2.0/24. Its route table has only 10.0.0.0/16 → local. The job calls an external lab API over HTTPS and times out. List the fix and why.', hint: 'Where can packets go?', solution: 'Add a NAT gateway in a public subnet (whose route table has 0.0.0.0/0 → igw) and add 0.0.0.0/0 → nat-… to the private route table. Keep the SG outbound rule allowing 443.', explain: 'With only the local route there is no path out. NAT gives outbound-only access without making the instance public.' }]
});

// ---------- Lesson 2 = Coursera 04 "VPC peering and Transit Gateway" ----------
Object.assign(ILL_FIGS, {
  awstgw: () => '<div class="aw-peer"><div class="aw-vb">VPC A</div><div class="aw-vb">VPC B</div><div class="aw-vb">VPC C</div><div class="aw-vb">VPN to office</div></div><div class="aw-down center">↓ each one is an attachment ↓</div>' +
    '<div class="aw-vb hub center">🔀 Transit gateway (one Region)<br><small>its own route tables decide which attachment reaches which</small></div>' +
    '<div class="figcap">A hub: 4 networks need 4 attachments instead of 6 peerings, and routing through the hub is transitive (A → hub → C works if the TGW route table allows it).</div>',
  awsmesh: sc => { const n = sc.fp.n; return '<div class="aw-req">' + n + ' VPCs, all talking to each other:<br>peerings needed = n(n−1)/2 = <b>' + (n * (n - 1) / 2) + '</b> · transit gateway attachments = <b>' + n + '</b></div>'; }
});
AWL({ id: 'aws2', title: 'Connecting VPCs: peering and Transit Gateway', cz: 'VPC peering and Transit Gateway',
  ill: { tables: {}, scenes: [
    { h: 'Peering joins exactly two VPCs', fig: 'awspeer', say: 'A peering connection links two VPCs so their private addresses can reach each other. It works across accounts and across Regions, but the two CIDR blocks must not overlap, and both sides add a route to the other\u2019s block.' },
    { h: 'Peering is not transitive', fig: 'awspeer', say: 'B is peered with A, and A with C. B still cannot reach C through A. B and C need their own peering.' },
    { h: 'Many VPCs: the mesh grows fast', fig: 'awsmesh', fp: { n: 10 }, say: 'Ten VPCs, all connected by peering, need 45 peering connections and route entries on every side.' },
    { h: 'Transit gateway: one hub', fig: 'awstgw', say: 'A transit gateway is a regional router. Each VPC or VPN is an attachment, and the transit gateway\u2019s route tables decide who reaches whom.' }],
  qs: [
    { k: 'mc', ref: false, q: 'VPC X is 10.0.0.0/16 and VPC Y is 10.0.0.0/16. Can you peer them?', o: ['No: the CIDR blocks overlap', 'Yes, if they are in different accounts', 'Yes, if they are in different Regions', 'Yes, with a NAT gateway'], w: [null, 'Accounts do not matter; overlap does.', 'Regions do not matter; overlap does.', 'Peering does not use NAT; overlapping ranges cannot be peered.'], why: 'Routing would be ambiguous: 10.0.1.5 would exist on both sides.' },
    { k: 'mc', ref: false, q: 'A (analytics) is peered with B (sales) and with C (HR). Can sales reach HR?', o: ['No: peering is not transitive', 'Yes, through A', 'Yes, if A allows it in its SG', 'Yes, after 24 hours'], w: [null, 'Traffic is never forwarded through a peered VPC.', 'Security groups cannot create a path.', 'Time changes nothing.'], why: 'B and C need their own peering, or all three join a transit gateway.' },
    { k: 'mc', ref: false, q: 'A university has 12 department VPCs and two campus VPN links that must all reach each other. Best fit?', o: ['a transit gateway', '66 peering connections', 'one big NAT gateway', 'an internet gateway per VPC'], w: [null, 'It works only for the VPCs (VPNs cannot be peered) and is painful to manage.', 'NAT is for outbound internet, not VPC-to-VPC.', 'That exposes them to the internet instead of joining them privately.'], why: 'A hub with attachments for VPCs and VPNs, with transitive routing.' },
    { k: 'mc', ref: false, q: 'After the peering is accepted, instances still cannot reach each other. Most likely missing?', o: ['routes to the peer\u2019s CIDR in both route tables', 'an internet gateway', 'a new VPC', 'an IAM group'], w: [null, 'Peering traffic is private; no IGW needed.', 'The VPCs exist already.', 'IAM does not route packets.'], why: 'Add destination = peer CIDR, target = pcx-… on both sides, and allow it in SGs/NACLs.' }] },
  theory: { why: 'A data platform rarely lives in one VPC: ingestion, warehouse and BI often sit in separate VPCs or accounts and must talk privately.',
    body: ['<b>VPC peering</b> connects two VPCs (same or different account or Region) over AWS\u2019s private network. Rules: no overlapping CIDRs, one-to-one, <b>not transitive</b>, routes on both sides, and SG/NACL rules still apply. No hourly fee; data transfer is charged.',
      'A <b>transit gateway</b> is a regional network hub. VPCs, VPN connections and Direct Connect gateways attach to it; its route tables control the paths. It costs per attachment-hour and per GB. Transit gateways in different Regions can be peered.',
      CZ('demo 05 creates two "public" subnets for the peering test.', 'the demo never adds an internet gateway route, so those subnets are private. Peering does not need public subnets at all.')],
    pro: 'We peered the BI VPC with the warehouse VPC; with more accounts we would move to a transit gateway.', q: { q: 'Why does peering forbid overlapping CIDRs?', a: 'A route says "send 10.0.1.0/24 to the peer". If both VPCs own 10.0.1.0/24, the address is ambiguous and the router cannot choose.' } },
  T: [
    ['aws2-peer', 'VPC peering', 'A private [[one-to-one link between two VPCs]]; it is [[not transitive]].',
      'VPC peering is {a private one-to-one connection between two VPCs}, and it is {not transitive}.', [
      [['a private connection between two VPCs', 'a one-to-one link between two VPCs'], [['a hub that connects many VPCs', 'That is a transit gateway.'], ['a connection between a VPC and the internet', 'That is an internet gateway.'], ['a link between two subnets of one VPC', 'Subnets of one VPC already route via the local route.']], { q: 'Which can VPC peering connect?', o: ['two VPCs in different accounts and Regions', 'a VPC and an office VPN', 'three VPCs at once', 'two VPCs with the same CIDR'], why: 'Cross-account and inter-Region are fine; VPNs, groups and overlaps are not.' }],
      [['not transitive', 'never forwarded through a third VPC'], [['transitive', 'Traffic is never forwarded through a peered VPC.'], ['always encrypted by you', 'AWS handles inter-Region peering encryption; that is not the property here.'], ['only one-way', 'Traffic flows both ways once routes exist.']], { q: 'A–B and B–C are peered. A to C?', o: ['no path', 'works through B', 'works with an IGW', 'works after DNS change'], why: 'Not transitive.' }]],
      'Requires non-overlapping CIDRs, acceptance by the peer owner, routes on both sides (target pcx-…); no edge-to-edge routing through the peer\u2019s IGW, NAT or VPN.',
      { k: 'image', t: 'Memory aid: <b>a private bridge between two islands</b>. Island B has a bridge to A, and A has one to C. Driving from B to C across A is not allowed: every bridge ends at its island.', j: 'a private one-to-one, non-transitive link between two VPCs' }],
    ['aws2-tgw', 'Transit gateway', 'A [[regional hub]] that [[routes between many attached networks]].',
      'A transit gateway is {a regional network hub} that {routes between many attached VPCs and VPNs}.', [
      [['a regional network hub', 'a regional router in the middle'], [['a global network', 'It is regional; connect Regions with TGW peering.'], ['a gateway to the internet', 'That is an internet gateway.'], ['a DNS service', 'That is Route 53.']], { q: 'Where does a transit gateway live?', o: ['in one Region', 'at an edge location', 'in one subnet', 'in every Region at once'], why: 'Regional resource.' }],
      [['routes between many attached VPCs and VPNs', 'connects many networks through attachments'], [['connects exactly two VPCs', 'That is peering.'], ['stores secrets', 'That is Secrets Manager.'], ['filters web requests', 'That is WAF.']], { q: 'Which can attach to a transit gateway?', o: ['VPCs, VPN connections and Direct Connect gateways', 'only VPCs in one account', 'only S3 buckets', 'IAM users'], why: 'Network attachments.' }]],
      'Routing through it is transitive, controlled by TGW route tables; billed per attachment-hour and per GB; can be shared across accounts with AWS RAM.',
      { k: 'contrast', t: 'Contrast pair: <b>peering = bridges</b> between pairs of islands; <b>transit gateway = a central bus terminal</b>. Every town runs one road to the terminal, and the terminal\u2019s timetable (route table) says where you can change.', j: 'a regional hub that routes between many attached networks' }]],
  qa: [{ id: 'aws2-q1', q: 'Five VPCs all connected: how many peerings, how many TGW attachments?', a: '5×4/2 = 10 peerings; 5 attachments.' },
    { id: 'aws2-q2', q: 'Name three peering rules.', a: 'No overlapping CIDRs; not transitive; routes needed in both route tables (plus SG/NACL rules).' }],
  problems: [{ id: 'aws2-p1', kind: 'open', title: 'A retailer joins three stores\u2019 VPCs', scenario: 'Store VPCs: 10.0.0.0/16, 10.1.0.0/16, 10.0.0.0/16. They want all to reach one shared reporting VPC (10.9.0.0/16). What blocks the plan, and what would you do?', hint: 'Look at the blocks.', solution: 'Two stores overlap (10.0.0.0/16), so they cannot both peer or route to the same VPC unambiguously. Re-address one store (e.g. 10.2.0.0/16), then peer each store with reporting (stores need not reach each other) or use a transit gateway.', explain: 'Overlap is the blocker; since only hub-and-spoke access is needed, three peerings suffice.' }]
});

// ---------- Lesson 3 = Coursera 06 "DNS" ----------
Object.assign(ILL_FIGS, {
  awsres: () => AWX.hops([['🧑‍💻', 'Laptop: "IP of reports.example.com?"', 'asks its resolver (e.g. the one the network provides)'], ['🔁', 'Resolver', 'checks its cache; if the answer is there and its TTL has not run out, it answers at once'],
      ['🌍', 'Root servers → .com servers', 'they do not know the answer, but say who is responsible for example.com'], ['📒', 'Authoritative name server for example.com', 'holds the record: reports A 203.0.113.20, TTL 300'],
      ['🧑‍💻', 'Laptop connects to 203.0.113.20:443', 'DNS only gave the address; the connection itself is separate']]),
  awsrec: () => '<table class="mini aw-rtab"><tr><th>Name</th><th>Type</th><th>Value</th><th>TTL</th></tr><tr><td>reports.example.com</td><td>A</td><td>203.0.113.20</td><td>300</td></tr><tr><td>reports.example.com</td><td>AAAA</td><td>2001:db8::20</td><td>300</td></tr><tr><td>www.example.com</td><td>CNAME</td><td>reports.example.com</td><td>300</td></tr><tr><td>example.com</td><td>MX</td><td>10 mail.example.com</td><td>3600</td></tr></table><div class="figcap">A → IPv4, AAAA → IPv6, CNAME → another name, MX → mail server. TTL = seconds a resolver may cache the answer.</div>'
});
AWL({ id: 'aws3', title: 'DNS: turning names into addresses', cz: 'DNS',
  ill: { tables: {}, scenes: [
    { h: 'One lookup, step by step', fig: 'awsres', say: 'A program asks a resolver. If the resolver has no cached answer, it walks the tree: root → .com → the domain\u2019s authoritative name server, which holds the record.' },
    { h: 'Records', fig: 'awsrec', say: 'The authoritative server stores records. The type says what the value is: A gives an IPv4 address, AAAA an IPv6 address, CNAME another name to look up.' }],
  qs: [
    { k: 'mc', ref: false, q: 'You change an A record, but some users still reach the old server for a few minutes. Why?', o: ['resolvers cached the old answer until its TTL ran out', 'DNS changes need a reboot', 'the A record is read-only', 'browsers ignore DNS'], w: [null, 'No reboot is involved.', 'You just changed it.', 'Browsers depend on DNS (and have their own caches too).'], why: 'TTL is how long a cached answer may be reused. Lower it before a planned move.' },
    { k: 'mc', ref: false, q: 'A school wants <code>learn.school.ng</code> to point to <code>portal.vendor.com</code>. Which record?', o: ['CNAME', 'A', 'MX', 'AAAA'], w: [null, 'A needs an IPv4 address, not a name.', 'MX is for mail.', 'AAAA needs an IPv6 address.'], why: 'CNAME maps a name to another name.' },
    { k: 'mc', ref: false, q: 'What does DNS NOT do?', o: ['carry the actual web page', 'map names to IP addresses', 'tell mail servers where mail goes', 'let answers be cached'], w: [null, 'That is DNS\u2019s main job.', 'MX records do that.', 'TTL controls caching.'], why: 'DNS returns addresses; the data then flows over a separate connection (e.g. HTTPS on 443).' },
    { k: 'cls', q: 'Which record type?', cats: ['A', 'AAAA', 'CNAME', 'MX'], items: [['api → 198.51.100.4', 0], ['api → 2001:db8::4', 1], ['shop → shops.platform.com', 2], ['bank.ng mail → 10 mx1.bank.ng', 3]], why: 'IPv4 → A; IPv6 → AAAA; name → CNAME; mail → MX.' }] },
  theory: { why: 'Every service you call in AWS (s3.eu-west-1.amazonaws.com, a Redshift endpoint, an RDS endpoint) is a DNS name first. Private endpoints work by changing what those names resolve to.',
    body: ['The <b>Domain Name System</b> maps names to records. A <b>resolver</b> finds answers (from cache, or by asking root, then TLD, then the <b>authoritative name server</b>). Records have a type (A, AAAA, CNAME, MX, TXT, NS…) and a <b>TTL</b> in seconds.',
      'DNS uses port 53 (UDP, and TCP for large answers). It only answers "where"; it does not carry the data.',
      'Risks: <b>DNS spoofing / cache poisoning</b> (a resolver is tricked into caching a false answer). Defences: <b>DNSSEC</b> (signed records a resolver can verify) and resolvers that validate. Route 53 supports DNSSEC signing for public hosted zones and validation in the Route 53 Resolver.',
      CZ('DNS as the internet\u2019s contact list: name → IP.', 'the phone book is fine for the idea. Add two things you need later: answers are cached for the TTL, and the zone apex (example.com itself) cannot be a CNAME, which is why Route 53 has alias records.')],
    pro: 'Drop the TTL to 60 seconds a day before the cut-over so the switch takes effect fast.', q: { q: 'Why not set every TTL to 1 second?', a: 'Every lookup would go to the authoritative server: slower answers, more queries (Route 53 charges per query) and less resilience. Short TTLs are for planned changes.' } },
  T: [
    ['aws3-dns', 'DNS', 'The system that [[maps domain names to records]] such as [[IP addresses]].',
      'DNS is {the system that maps domain names} to {records such as IP addresses}.', [
      [['the system that maps domain names', 'the service that translates names'], [['the system that encrypts web traffic', 'That is TLS.'], ['the system that routes packets', 'Routers and route tables do that.'], ['the system that stores web pages', 'Web servers and caches do that.']], { q: 'A user types shop.example.com. What happens first?', o: ['a DNS lookup for its address', 'the page downloads', 'CloudFront caches it', 'IAM checks the user'], why: 'Name first, then connect.' }],
      [['records such as IP addresses', 'records like IP addresses'], [['passwords', 'DNS holds no passwords.'], ['port numbers only', 'Ports are not what A/AAAA records hold.'], ['IAM roles', 'Not DNS.']], { q: 'Which is a DNS record value?', o: ['203.0.113.20', 'my-secret-password', 'arn:aws:iam::123:role/x', 's3:GetObject'], why: 'An A record value is an IPv4 address.' }]],
      'Hierarchical: root → TLD → authoritative servers; resolvers cache answers for the record TTL; port 53 UDP/TCP.',
      { k: 'split', t: 'Memory aid: <b>D-N-S = Domain Name System</b>. Picture a <b>phone book</b>: you look up "Mama Put Restaurant" (the name) to get the number (the IP) and then you call (connect) yourself.', j: 'maps domain names to records such as IP addresses' }],
    ['aws3-rec', 'DNS record', 'One [[name, type and value]] entry, cached for its [[TTL]].',
      'A DNS record is {a name, a type and a value}, cached for {its TTL in seconds}.', [
      [['a name, a type and a value', 'name + type + value'], [['a name and a password', 'No passwords in DNS.'], ['a domain and its owner\u2019s address', 'Owner details are WHOIS/registration data, not records.'], ['an IP and a port', 'Records like A hold addresses, not ports.']], { q: 'www → shop.example.com. Which part is the type?', o: ['CNAME', 'www', 'shop.example.com', '300'], why: 'Name www, type CNAME, value shop.example.com, TTL 300.' }],
      [['its TTL in seconds', 'its time to live'], [['forever', 'Caches drop the answer when its TTL ends.'], ['one hour, always', 'You choose the TTL.'], ['until the browser restarts', 'TTL is set on the record.']], { q: 'TTL 3600 means a resolver may reuse the answer for…', o: ['up to 1 hour', '3600 days', 'exactly 3600 lookups', 'never'], why: 'Seconds.' }]],
      'Types: A, AAAA, CNAME (not at zone apex), MX, TXT, NS, SOA; TTL in seconds; changes propagate as caches expire.',
      { k: 'split', t: 'Memory aid for <b>AAAA</b>: an IPv6 address has 128 bits, <b>four times</b> the 32 bits of IPv4, so think "A × 4". (A handy picture; the RFC does not explain the name.) <b>TTL = time to live</b>: how long the cached answer may live.', j: 'one name + type + value entry, cached for its time to live' }],
    ['aws3-resolver', 'DNS resolver', 'A server that [[looks up DNS answers for you]] and [[caches them]].',
      'A DNS resolver {asks other DNS servers on your behalf} and {caches the answers for their TTL}.', [
      [['asks other DNS servers on your behalf', 'looks up answers for the client'], [['holds the real records for a domain', 'That is the authoritative name server.'], ['registers domain names', 'That is a registrar.'], ['routes packets between subnets', 'That is a route table.']], { q: 'Inside a VPC, which resolver answers by default?', o: ['the Amazon-provided resolver at the VPC base address + 2', 'the root servers directly', 'CloudFront', 'the NAT gateway'], why: 'The .2 address of the VPC range (Route 53 Resolver).' }],
      [['caches the answers for their TTL', 'keeps answers until the TTL ends'], [['caches answers forever', 'Only until the TTL ends.'], ['never caches', 'Caching is the main speed-up.'], ['caches web pages', 'That is a CDN.']], { q: 'Two lookups of the same name within the TTL: the second one is…', o: ['answered from the resolver\u2019s cache', 'sent to the root again', 'blocked', 'slower'], why: 'Cached until the TTL ends.' }]],
      'A recursive resolver walks root → TLD → authoritative and caches; in a VPC it is Route 53 Resolver at the base address + 2 (also 169.254.169.253).',
      { k: 'contrast', t: 'Contrast pair: <b>resolver = the librarian</b> who goes and finds the answer for you (and remembers it for a while). <b>Authoritative server = the author</b> who wrote the book and knows the answer for sure.', j: 'asks other DNS servers on your behalf and caches the answers' }],
    ['aws3-auth', 'Authoritative name server', 'The server that [[holds the real records]] for [[one domain]].',
      'An authoritative name server {holds the real records} for {a domain} and gives the final answer.', [
      [['holds the real records', 'stores the domain\u2019s actual records'], [['caches other servers\u2019 answers', 'That is a resolver.'], ['only knows the top-level domains', 'Those are TLD servers.'], ['encrypts the records', 'Not its job (DNSSEC signs, it does not encrypt).']], { q: 'Your domain is hosted in Route 53. Who is authoritative for it?', o: ['Route 53\u2019s name servers for your hosted zone', 'your laptop', 'the .com servers', 'your ISP\u2019s resolver'], why: 'The NS records point to Route 53\u2019s servers.' }],
      [['a domain', 'one zone'], [['the whole internet', 'Each server is authoritative only for its zones.'], ['one IP address', 'It answers for names in a zone.'], ['one browser', 'Not tied to clients.']], { q: 'Which server gives the final answer for bank.example?', o: ['bank.example\u2019s authoritative server', 'a root server', 'any resolver', 'the browser'], why: 'Root and TLD only point the way.' }]],
      'It is listed by the zone\u2019s NS records at the TLD; Route 53 assigns four name servers to each hosted zone.',
      { k: 'image', t: 'Memory aid: <b>the author</b> of the book (authoritative): everyone else is quoting; the author knows.', j: 'holds the real records for a domain and gives the final answer' }]],
  qa: [{ id: 'aws3-q1', q: 'A vs AAAA vs CNAME?', a: 'A: name → IPv4. AAAA: name → IPv6. CNAME: name → another name.' },
    { id: 'aws3-q2', q: 'What is an authoritative name server?', a: 'The server that holds the zone\u2019s records and gives the final answer; resolvers only cache it.' }],
  problems: [{ id: 'aws3-p1', kind: 'open', title: 'Plan a database move for a hospital app', scenario: 'The app connects to db.clinic.example (A record, TTL 86400). Tonight the database moves to a new IP. Users must switch within 5 minutes. What do you do and when?', hint: 'Caches.', solution: 'At least a day before (one old TTL), lower the TTL to 60-300 s. At the cut-over, change the A record. Afterwards raise the TTL again.', explain: 'Resolvers keep the old answer up to the old TTL (24 h), so the TTL must already be short when you change the value.' }]
});

// ---------- Lesson 4 = Coursera 07 "Route 53 explained" ----------
Object.assign(ILL_FIGS, {
  r53pol: sc => { const P = { simple: ['Simple', 'one record, one answer (several values are returned in random order)'], weighted: ['Weighted', 'v1: 80 · v2: 20 → about 80% of answers point to v1'], latency: ['Latency', 'answers with the Region that has the lowest measured latency for the user'], failover: ['Failover', 'primary while its health check passes; otherwise the secondary'],
      geoloc: ['Geolocation', 'by the user\u2019s location: continent, country (or US state); plus a default'], geoprox: ['Geoproximity', 'by distance to your resources, with a bias to grow or shrink an area'], multi: ['Multivalue answer', 'up to 8 healthy records, chosen at random'], ip: ['IP-based', 'by the user\u2019s source IP range (CIDR) that you list'] };
    const on = (sc.fp && sc.fp.on) || []; return '<div class="aw-opts">' + Object.keys(P).map(k => '<div class="aw-opt' + (on.includes(k) ? ' on' : '') + '"><b>' + P[k][0] + '</b><div class="small">' + P[k][1] + '</div></div>').join('') + '</div><div class="figcap">The 8 routing policies. Coursera covers 6; geoproximity and IP-based are added here.</div>'; },
  r53alias: () => '<table class="mini aw-rtab"><tr><th>Name</th><th>Type</th><th>Value</th><th></th></tr><tr class="aw-hl"><td>example.com</td><td>A (alias)</td><td>d111.cloudfront.net</td><td class="small">✓ allowed at the apex</td></tr><tr><td>example.com</td><td>CNAME</td><td>d111.cloudfront.net</td><td class="small bad">✗ not allowed at the apex</td></tr><tr><td>www.example.com</td><td>CNAME</td><td>example.com</td><td class="small">✓ fine below the apex</td></tr></table>' +
    '<div class="figcap">An alias record is a Route 53 extension. It points to an AWS resource (CloudFront, a load balancer, an S3 website, another record) and follows that resource\u2019s IPs as they change.</div>'
});
AWL({ id: 'aws4', title: 'Amazon Route 53: DNS in AWS', cz: 'Route 53 explained',
  ill: { tables: {}, scenes: [
    { h: 'Where Route 53 sits', fig: 'awsdns', say: 'Route 53 hosts your domain\u2019s records in a hosted zone and answers DNS queries for it. Here it points shop.example.com at a CloudFront distribution.' },
    { h: 'Eight ways to choose an answer', fig: 'r53pol', fp: {}, say: 'A routing policy decides WHICH answer a query gets. Coursera teaches six; AWS has eight.' },
    { h: 'Failover needs a health check', fig: 'r53pol', fp: { on: ['failover'] }, say: 'Route 53 health checks probe an endpoint (HTTP, HTTPS or TCP). When the primary fails, answers switch to the secondary.' },
    { h: 'Alias records', fig: 'r53alias', say: 'The domain itself (the apex, example.com) cannot be a CNAME. An alias record solves that for AWS targets.' }],
  qs: [
    { k: 'mc', ref: false, q: 'A bank wants all traffic on its main site, and a standby site only when the main one is down.', o: ['Failover routing with a health check', 'Weighted 50/50', 'Latency routing', 'Simple routing'], w: [null, 'That sends half the users to the standby all the time.', 'That picks the fastest Region, not primary/standby.', 'Simple has no health-based switch.'], why: 'Failover = primary while healthy, secondary otherwise.' },
    { k: 'mc', ref: false, q: 'A shop tests a new checkout on 10% of users.', o: ['Weighted routing (90/10)', 'Geolocation routing', 'Failover routing', 'Multivalue answer'], w: [null, 'That routes by where users are, not by share.', 'That is for outages.', 'That spreads across healthy values randomly, no set share.'], why: 'Weights set the share of answers.' },
    { k: 'mc', ref: false, q: 'A news site must show Nigerian users the Nigerian edition, by country.', o: ['Geolocation routing', 'Latency routing', 'Weighted routing', 'IP-based routing'], w: [null, 'Latency picks the fastest Region, which may not match the country.', 'Weights ignore location.', 'IP-based uses CIDR ranges you list, e.g. an ISP\u2019s; country is geolocation\u2019s job.'], why: 'Geolocation answers by continent/country.' },
    { k: 'mc', ref: false, q: 'Can <code>example.com</code> (the apex) be a CNAME to a load balancer\u2019s DNS name?', o: ['No: use a Route 53 alias record', 'Yes, always', 'Yes, with TTL 0', 'Only for IPv6'], w: [null, 'DNS rules forbid a CNAME at the apex (it must hold SOA/NS).', 'TTL does not change the rule.', 'Not related to IPv6.'], why: 'Alias records can sit at the apex and point to AWS resources.' },
    { k: 'mc', ref: false, q: 'An A record holds an EC2 instance\u2019s public IP. You replace the instance and it gets a new IP. What happens?', o: ['The record still points to the old IP until you change it', 'Route 53 updates it automatically', 'The record is deleted', 'Traffic is sent to the new instance by AWS'], w: [null, 'Only alias records follow AWS targets automatically, and not for EC2 IPs.', 'Records are never deleted for you.', 'No such magic for plain records.'], why: 'Put a load balancer in front and alias to it, or update the record.' }] },
  theory: { why: 'Route 53 is how users and pipelines find your endpoints, and how traffic moves away from a failed Region.',
    body: ['A <b>hosted zone</b> holds the records for one domain: <b>public</b> (answers the internet) or <b>private</b> (answers only inside associated VPCs). Route 53 also registers domains and runs <b>health checks</b>.',
      'A <b>routing policy</b> decides which answer a query gets: simple, weighted, latency, failover, geolocation, geoproximity, multivalue answer, IP-based.',
      'An <b>alias record</b> (Route 53 only) points a name, even the apex, at an AWS resource such as CloudFront or a load balancer; queries to alias records for AWS resources are free.',
      CZ('six routing policies, and that when you move from one instance to another "Route 53 will automatically update".', 'there are eight policies (add geoproximity and IP-based). Automatic following is true only for <b>alias</b> targets such as load balancers, not for a plain record holding an EC2 IP.')],
    pro: 'Private hosted zone for internal names, alias records to the ALB, failover routing between Regions.', q: { q: 'Why does failover need health checks?', a: 'DNS itself cannot tell a server is down. The health check result is what makes Route 53 stop answering with the primary.' } },
  T: [
    ['aws4-r53', 'Amazon Route 53', 'AWS\u2019s [[DNS service]], plus [[domain registration]] and [[health checks]].',
      'Route 53 is {AWS\u2019s DNS service}, which also does {domain registration and health checks}.', [
      [['AWS\u2019s DNS service', 'the AWS DNS service'], [['AWS\u2019s CDN', 'That is CloudFront.'], ['AWS\u2019s firewall', 'That is WAF.'], ['AWS\u2019s router between VPCs', 'That is a transit gateway.']], { q: 'Which service answers "what IP is shop.example.com?" in AWS?', o: ['Route 53', 'CloudFront', 'Shield', 'IAM'], why: 'DNS = Route 53.' }],
      [['domain registration and health checks', 'registering domains and checking endpoints'], [['caching and compression', 'That is CloudFront.'], ['encryption and key rotation', 'That is KMS.'], ['login and MFA', 'That is IAM.']], { q: 'Route 53 can stop sending users to a dead server because of…', o: ['health checks', 'caching', 'security groups', 'MFA'], why: 'Health checks drive failover.' }]],
      'Global service; hosted zones (public/private), 8 routing policies, alias records, health checks, Resolver for VPCs, DNSSEC.',
      { k: 'origin', t: '<b>Route 53: the "53" is DNS\u2019s port.</b> AWS\u2019s own FAQ says the name comes from DNS servers answering on port 53 and routing users to your applications. (The popular link to US Route 66 is folklore, not an AWS statement.)', j: 'AWS\u2019s DNS service, with domain registration and health checks' }],
    ['aws4-hz', 'Hosted zone', 'The [[container for one domain\u2019s records]] in Route 53, [[public or private]].',
      'A hosted zone is {the container for one domain\u2019s DNS records} in Route 53, either {public or private}.', [
      [['the container for one domain\u2019s DNS records', 'the set of records for one domain'], [['a group of servers', 'It holds records, not servers.'], ['an Availability Zone', 'Not related to AZs despite "zone".'], ['a cache of web pages', 'That is CloudFront.']], { q: 'You buy clinic.example. Where do its A records live in Route 53?', o: ['in the clinic.example hosted zone', 'in an AZ', 'in a VPC subnet', 'in IAM'], why: 'Records live in the hosted zone.' }],
      [['public or private', 'internet-facing or VPC-only'], [['always public', 'Private hosted zones answer only inside associated VPCs.'], ['always private', 'Public zones answer the internet.'], ['regional or global', 'That is not the split.']], { q: 'An internal API name must resolve only inside your VPCs.', o: ['private hosted zone', 'public hosted zone', 'CloudFront', 'a NACL'], why: 'Private = VPC-only.' }]],
      'Each public hosted zone gets 4 name servers (NS) and an SOA; a private one is associated with VPCs; billed per zone per month plus queries.',
      { k: 'contrast', t: 'Contrast pair: a <b>hosted zone</b> is a <b>DNS zone</b> (one domain\u2019s address book). An <b>Availability Zone</b> is a <b>place</b> with data centres. Same word "zone", unrelated jobs.', j: 'the container for one domain\u2019s DNS records, public or private' }],
    ['aws4-alias', 'Alias record', 'A record that [[points to an AWS resource]] and [[works at the apex]].',
      'An alias record {points a name to an AWS resource} and, unlike a CNAME, {works at the zone apex}.', [
      [['points a name to an AWS resource', 'points to an AWS target'], [['points a name to any other name anywhere', 'Alias targets are AWS resources or records in the same zone.'], ['stores a password', 'Records hold no passwords.'], ['points to an IP you type', 'That is an A record.']], { q: 'Which can be an alias target?', o: ['a CloudFront distribution', 'any website on the internet', 'an IAM role', 'a KMS key'], why: 'AWS resources such as CloudFront, ELB, S3 website, API Gateway.' }],
      [['works at the zone apex', 'can be used for the bare domain'], [['works only below the apex', 'That is CNAME\u2019s limit.'], ['works only in private zones', 'Both public and private.'], ['works only for IPv6', 'A or AAAA alias.']], { q: 'example.com must point to a load balancer.', o: ['alias A record', 'CNAME', 'MX', 'TXT'], why: 'CNAME is not allowed at the apex.' }]],
      'Free for queries to AWS resource targets; follows the target\u2019s IP changes; type A/AAAA; can evaluate target health.',
      { k: 'contrast', t: 'Contrast pair: <b>CNAME = a nickname that says "ask for that other name"</b> (not allowed for the family name, the apex). <b>Alias = Route 53 answers with the target\u2019s current address itself</b>, so even the apex works.', j: 'a Route 53 record that points to an AWS resource and works at the zone apex' }],
    ['aws4-weighted', 'Weighted routing', 'Splits answers [[between targets by set proportions]].',
      'Weighted routing {splits DNS answers between targets} {in proportions you set}.', [
      [['splits DNS answers between targets', 'shares answers between records'], [['sends each user to the fastest Region', 'That is latency routing.'], ['uses a backup when the primary fails', 'That is failover.'], ['answers by the user\u2019s country', 'That is geolocation.']], { q: 'Blue/green release, 5% to green.', o: ['weighted', 'latency', 'failover', 'geolocation'], why: 'Set weights 95/5.' }],
      [['in proportions you set', 'by weights you choose'], [['equally, always', 'You choose the weights.'], ['by latency', 'That is latency routing.'], ['at random with no control', 'Weights control the share.']], { q: 'Weights 3 and 1. Share of answers for the first?', o: ['about 75%', '3%', '25%', '100%'], why: '3 / (3+1).' }]],
      'Share = weight / sum of weights; weight 0 stops answers; can combine with health checks.',
      { k: 'image', t: 'Memory aid: a <b>market seller\u2019s scale</b>: put 8 weights on one side, 2 on the other, and that is how the crowd splits.', j: 'splits DNS answers between targets in proportions you set' }],
    ['aws4-latency', 'Latency routing', 'Answers with [[the Region giving the user the lowest latency]].',
      'Latency routing {answers with the Region} that gives {the lowest latency for the user}.', [
      [['answers with the Region', 'picks a Region'], [['answers with the nearest country', 'Latency is measured network delay, not borders.'], ['answers with the cheapest server', 'Cost is not considered.'], ['answers with a random server', 'That is closer to multivalue.']], { q: 'Users in Lagos and London; app in eu-west-2 and af-south-1.', o: ['latency routing', 'weighted', 'failover', 'simple'], why: 'Each user gets the faster Region.' }],
      [['the lowest latency for the user', 'the fastest response for that user'], [['the shortest distance', 'Geography and network delay are not the same; distance is geoproximity.'], ['the most capacity', 'Not measured.'], ['the newest version', 'That is weighted testing.']], { q: 'What does Route 53 compare?', o: ['measured latency between user networks and Regions', 'server CPU', 'prices', 'country names'], why: 'Latency data per Region.' }]],
      'Based on AWS\u2019s latency measurements between networks and Regions, which can change; not the same as geolocation or geoproximity.',
      { k: 'image', t: 'Memory aid: <b>two queues at the bank</b>; you join the one that moves fastest, not the one nearest the door.', j: 'answers with the Region that gives the user the lowest latency' }],
    ['aws4-failover', 'Failover routing', 'Answers with [[the primary while healthy]], else [[the secondary]].',
      'Failover routing answers with {the primary while its health check passes}, otherwise {the secondary}.', [
      [['the primary while its health check passes', 'the main target while healthy'], [['both targets equally', 'That is weighted 50/50.'], ['the fastest target', 'That is latency.'], ['the primary forever', 'Without a switch there is no failover.']], { q: 'What makes Route 53 switch to the secondary?', o: ['a failing health check', 'a user request', 'midnight', 'a CloudFront miss'], why: 'Health-check driven.' }],
      [['the secondary', 'the standby'], [['nothing', 'Answers move to the secondary.'], ['a random IP', 'You define the secondary.'], ['the root servers', 'Not related.']], { q: 'A static "we\u2019ll be right back" S3 site is a common…', o: ['secondary record', 'primary record', 'hosted zone', 'health check'], why: 'Standby when the primary fails.' }]],
      'Active-passive; the primary needs a health check (or evaluate target health for aliases); switching is as fast as TTL and check interval allow.',
      { k: 'image', t: 'Memory aid: a <b>generator</b> at home: NEPA (the primary) on, generator off; NEPA fails, the generator takes over.', j: 'answers with the primary while healthy, otherwise the secondary' }]],
  qa: [{ id: 'aws4-q1', q: 'List the 8 routing policies.', a: 'Simple, weighted, latency, failover, geolocation, geoproximity, multivalue answer, IP-based.' },
    { id: 'aws4-q2', q: 'Public vs private hosted zone?', a: 'Public answers the internet; private answers only inside the VPCs associated with it.' },
    { id: 'aws4-q3', q: 'Why use an alias instead of a CNAME?', a: 'It works at the apex, follows AWS targets\u2019 IPs, and alias queries to AWS resources are free.' }],
  problems: [{ id: 'aws4-p1', kind: 'open', title: 'Route a pharmacy chain\u2019s site', scenario: 'pharma.example runs in two Regions. Users should get the faster Region, and if one Region is down, only the healthy one. The site lives behind a load balancer in each Region. Which records and policies?', hint: 'Combine a policy with health.', solution: 'Two alias A records for pharma.example, latency routing, one per Region pointing to that Region\u2019s load balancer, with "evaluate target health" on (or health checks).', explain: 'Latency picks the faster Region; health makes unhealthy records drop out; alias is needed at the apex.' }]
});

// ---------- Lesson 5 = Coursera 08 "Understanding CloudFront" ----------
Object.assign(ILL_FIGS, {
  cfhit: sc => { const m = sc.fp && sc.fp.miss; return AWX.hops([['🧑‍💻', 'User in London: GET /img/logo.png', 'DNS sent them to a nearby edge location'],
      ['📍', 'Edge location (London)', m ? 'miss: no copy yet, ask the regional edge cache' : 'hit: copy found and still fresh (inside its TTL), served at once', m ? '' : 'aw-key']].concat(m ? [['🏬', 'Regional edge cache', 'bigger, fewer sites: miss again, ask the origin'], ['🪣', 'Origin: S3 bucket in af-south-1', 'returns the file; both caches keep a copy for next time', 'aw-key']] : [])); },
  cfkey: () => '<table class="mini aw-rtab"><tr><th>Request</th><th>Cache key with the default policy (CachingOptimized)</th></tr><tr><td>/img/logo.png?v=1</td><td>d111.cloudfront.net + /img/logo.png</td></tr><tr><td>/img/logo.png?v=2</td><td>d111.cloudfront.net + /img/logo.png (same key: same cached copy)</td></tr></table><div class="figcap">By default only the domain and the URL path form the cache key. To cache per query string, header or cookie, add it to the cache policy.</div>',
  cfoac: () => '<div class="aw-lanes"><div class="aw-lane"><div class="aw-lab">✅ Through CloudFront</div><div class="small">user → edge → origin access control signs the request → bucket policy allows only this distribution</div></div><div class="aw-lane"><div class="aw-lab">⛔ Straight to S3</div><div class="small">user → bucket URL → Block Public Access + bucket policy: denied</div></div></div>'
});
AWL({ id: 'aws5', title: 'Amazon CloudFront: content from close by', cz: 'Understanding CloudFront',
  ill: { tables: {}, scenes: [
    { h: 'A cache miss', fig: 'cfhit', fp: { miss: true }, say: 'The first request for a file at an edge location misses. The edge asks a regional edge cache, then the origin, and keeps a copy.' },
    { h: 'A cache hit', fig: 'cfhit', fp: {}, say: 'The next user nearby gets the copy straight from the edge until its TTL runs out.' },
    { h: 'What counts as "the same file": the cache key', fig: 'cfkey', say: 'CloudFront looks up a copy by its cache key. With the default cache policy that is just the domain and path.' },
    { h: 'Keep the bucket private: OAC', fig: 'cfoac', say: 'With origin access control, only CloudFront may read the S3 bucket, so users cannot skip CloudFront.' }],
  qs: [
    { k: 'mc', ref: false, q: 'A Lagos shop serves product photos to customers in London from an S3 bucket in af-south-1. Photos load slowly. Best fix?', o: ['Put CloudFront in front of the bucket', 'Move to a bigger bucket', 'Add a NAT gateway', 'Use Route 53 weighted routing'], w: [null, 'Buckets have no size tiers; distance is the problem.', 'NAT is for private-subnet outbound traffic.', 'DNS cannot make a far file closer.'], why: 'Edge locations near London cache the photos.' },
    { k: 'mc', ref: false, q: 'You uploaded a new logo with the same name, but users still see the old one.', o: ['Create an invalidation (or wait for the TTL); better: version the file name', 'Delete the distribution', 'Change the Region', 'Turn on MFA'], w: [null, 'Overkill: you lose the whole CDN.', 'Caches are at edges, not Regions.', 'Unrelated to caching.'], why: 'Cached copies live until their TTL; an invalidation removes them early.' },
    { k: 'mc', ref: false, q: 'With the default cache policy, are <code>/report.csv?day=1</code> and <code>/report.csv?day=2</code> cached separately?', o: ['No: query strings are not in the default cache key', 'Yes, always', 'Only on HTTPS', 'Only for S3 origins'], w: [null, 'Only if you add the query string to the cache policy.', 'Protocol does not change the key.', 'Origin type does not change it.'], why: 'Default key = domain + path. Coursera says headers, cookies and query strings are used by default; that is not the default.' },
    { k: 'mc', ref: false, q: 'Users must not download straight from the S3 bucket, only through CloudFront.', o: ['Origin access control + a bucket policy allowing only the distribution', 'Make the bucket public', 'Use a NACL on S3', 'Add a CNAME'], w: [null, 'The opposite.', 'S3 is not in your subnet; NACLs do not apply.', 'DNS cannot block S3 access.'], why: 'OAC is the current method (it replaced the older origin access identity).' }] },
  theory: { why: 'Dashboards, exported reports and public datasets are files people download; a CDN makes them fast and protects the origin.',
    body: ['<b>CloudFront</b> is AWS\u2019s content delivery network. A <b>distribution</b> has one or more <b>origins</b> (S3, a load balancer, EC2, any HTTP server). Users reach <b>edge locations</b>; misses go via <b>regional edge caches</b> to the origin.',
      '<b>Behaviors</b> map URL paths to origins and settings. A <b>cache policy</b> sets TTLs and the <b>cache key</b>. <b>Invalidation</b> removes cached copies early. Security: HTTPS/TLS at the edge, <b>signed URLs/cookies</b>, <b>geographic restrictions</b>, Shield Standard automatically, WAF if you attach it, and <b>OAC</b> for S3 origins.',
      CZ('CloudFront caches content using headers, cookies and query strings.', 'by default (CachingOptimized) only the domain and URL path are in the cache key. Headers, cookies and query strings are added only if you include them in the cache policy.')],
    pro: 'Exports go to a private bucket behind CloudFront with OAC, served over HTTPS with signed URLs.', q: { q: 'Why does putting query strings in the cache key lower the hit rate?', a: 'Each distinct value makes a separate cached copy, so fewer requests find an existing one.' } },
  T: [
    ['aws5-cf', 'Amazon CloudFront', 'AWS\u2019s [[content delivery network]]: it [[caches content at edge locations]] near users.',
      'CloudFront is {AWS\u2019s content delivery network}, which {caches content at edge locations near users}.', [
      [['AWS\u2019s content delivery network', 'the AWS CDN'], [['AWS\u2019s DNS service', 'That is Route 53.'], ['AWS\u2019s object storage', 'That is S3; CloudFront serves from it.'], ['AWS\u2019s DDoS service', 'That is Shield (which protects CloudFront).']], { q: 'Which service brings files closer to far-away users?', o: ['CloudFront', 'Route 53', 'IAM', 'KMS'], why: 'A CDN.' }],
      [['caches content at edge locations near users', 'keeps copies at edges close to users'], [['copies data to every Region', 'Edges are not Regions; S3 replication is separate.'], ['stores the only copy of the data', 'The origin keeps the master copy.'], ['encrypts data at rest', 'That is KMS/S3.']], { q: 'Where does a cache hit come from?', o: ['the edge location', 'the origin bucket', 'the user\u2019s VPC', 'Route 53'], why: 'Hit = served at the edge.' }]],
      'Distributions with origins and behaviors; edge locations + regional edge caches; cache policies; OAC; signed URLs; integrates with Shield and WAF.',
      { k: 'image', t: 'Memory aid: <b>clouds in front</b> of the main store. Many small <b>front</b> shops (edges) stock the popular items, so you do not travel to the warehouse (origin).', j: 'AWS\u2019s CDN, caching content at edge locations near users' }],
    ['aws5-edge', 'Edge location', 'An [[AWS site near users]] where CloudFront [[caches content]].',
      'An edge location is {an AWS site near users} where CloudFront {caches and serves content}.', [
      [['an AWS site near users', 'a nearby AWS point of presence'], [['an Availability Zone', 'Edges are separate, far more numerous sites.'], ['a Region', 'There are far more edges than Regions.'], ['a user\u2019s laptop', 'Browsers cache too, but that is not an edge.']], { q: 'Edge locations are…', o: ['more numerous than Regions', 'the same as AZs', 'inside your VPC', 'only in us-east-1'], why: 'Hundreds of points of presence.' }],
      [['caches and serves content', 'keeps and serves copies'], [['runs your database', 'Databases run in Regions.'], ['stores IAM users', 'IAM is global, not at edges.'], ['routes VPC traffic', 'Not its job.']], { q: 'A hit means the file came from…', o: ['an edge cache', 'the origin', 'a NAT gateway', 'a VPN'], why: 'Edge.' }]],
      'Points of presence also run Route 53 and Shield; regional edge caches sit between edges and origins.',
      { k: 'image', t: 'Memory aid: <b>the edge of the network</b>, right where users are, like a kiosk at the edge of every street.', j: 'an AWS site near users where CloudFront caches and serves content' }],
    ['aws5-origin', 'Origin', 'Where CloudFront [[fetches content on a cache miss]].',
      'An origin is {where CloudFront fetches the content} {on a cache miss}.', [
      [['where CloudFront fetches the content', 'the source CloudFront reads from'], [['where users start', 'Users are clients, not origins.'], ['where logs are stored', 'Logs can go to S3, but that is not the origin.'], ['where DNS records live', 'That is a hosted zone.']], { q: 'Which can be an origin?', o: ['an S3 bucket or a load balancer', 'an IAM role', 'a KMS key', 'a NACL'], why: 'HTTP sources.' }],
      [['on a cache miss', 'when the edge has no fresh copy'], [['on every request', 'Then there would be no cache.'], ['only once a year', 'Whenever the copy is missing or expired.'], ['only on HTTPS', 'Protocol is not the trigger.']], { q: 'The origin is contacted when…', o: ['the edge and regional cache miss or the copy expired', 'a hit happens', 'DNS answers', 'the user logs in'], why: 'Miss or expiry.' }]],
      'S3 (use OAC), ALB/EC2/custom HTTP origins; origin groups give origin failover; Origin Shield adds a central cache layer.',
      { k: 'split', t: 'Memory aid: <b>origin = where it originally lives</b>. Copies travel; the original stays home.', j: 'where CloudFront fetches content on a cache miss' }],
    ['aws5-inval', 'Invalidation', 'Removes [[cached copies]] so the next request [[goes to the origin]].',
      'An invalidation {removes cached copies early}, so the next request {fetches from the origin}.', [
      [['removes cached copies early', 'clears copies from the edge caches'], [['deletes the file at the origin', 'The origin is untouched.'], ['blocks the user', 'That is WAF/geo restriction.'], ['rotates a key', 'That is KMS.']], { q: 'The price list changed and edges show the old one.', o: ['invalidate /prices.json', 'delete the bucket', 'change DNS TTL', 'add MFA'], why: 'Clear the cached copy.' }],
      [['fetches from the origin', 'goes back to the origin'], [['fetches from the browser', 'No.'], ['fails', 'It succeeds with fresh content.'], ['is served stale', 'Cleared copies cannot be served.']], { q: 'After an invalidation, the next request is…', o: ['a miss that fetches from the origin', 'a hit on the old copy', 'blocked', 'redirected to S3 directly'], why: 'Miss → origin.' }]],
      'Paths can use * wildcards; the first 1,000 invalidation paths a month are free; versioned file names (logo.v2.png) avoid invalidations.',
      { k: 'split', t: 'Memory aid: <b>in-valid-ation = making the copy in-valid</b>. Stamp "expired" on it; the next customer gets a fresh one.', j: 'removes cached copies so the next request fetches from the origin' }]],
  qa: [{ id: 'aws5-q1', q: 'What is in the default cache key?', a: 'The distribution domain and the URL path; query strings, headers and cookies are not, unless you add them.' },
    { id: 'aws5-q2', q: 'OAC vs a public bucket?', a: 'OAC lets only CloudFront read a private bucket; a public bucket lets anyone skip CloudFront.' }],
  problems: [{ id: 'aws5-p1', kind: 'open', title: 'Serve a hospital\u2019s patient-education videos', scenario: 'Videos sit in S3 in eu-west-1; viewers are in Nigeria and Ghana. Only logged-in patients may watch, and nobody should fetch the bucket directly. Design it.', hint: 'Three features.', solution: 'CloudFront distribution with the bucket as origin and OAC (bucket policy allows only this distribution, Block Public Access on); signed URLs or signed cookies issued after login; HTTPS only.', explain: 'Edges near West Africa speed delivery, OAC closes the bucket, signed URLs restrict who may view.' }]
});

// ---------- Lesson 6 = Coursera 09 "AWS PrivateLink" (+ VPC endpoints, which Coursera leaves out) ----------
AWL({ id: 'aws6', title: 'PrivateLink and VPC endpoints', cz: 'AWS PrivateLink',
  ill: { tables: {}, scenes: [
    { h: 'Three ways from a private subnet to S3', fig: 'awsep', fp: {}, say: 'A Glue job in a private subnet must read S3. It can go out through NAT, through a gateway endpoint, or through an interface endpoint.' },
    { h: 'Gateway endpoint: a route-table target', fig: 'awsvpc', fp: { ep: true, hl: 'prv' }, say: 'A gateway endpoint adds a route: the S3 prefix list → vpce-…. Traffic to S3 never touches NAT or the internet gateway. Only S3 and DynamoDB have gateway endpoints.' },
    { h: 'Interface endpoint: a private IP in your subnet', fig: 'awsep', fp: { hl: 'if' }, say: 'An interface endpoint (AWS PrivateLink) puts a network interface with a private IP in your subnet. DNS for the service name resolves to that IP.' }],
  qs: [
    { k: 'mc', ref: false, q: 'A Glue job in a private subnet with no NAT hangs reading S3. Cheapest fix?', o: ['Add an S3 gateway endpoint and its route', 'Add a NAT gateway', 'Make the subnet public', 'Add an IAM group'], w: [null, 'It works, but costs per hour and per GB.', 'Glue network interfaces do not get public IPs; the job still fails.', 'IAM does not create a network path.'], why: 'Gateway endpoints for S3/DynamoDB have no extra charge.' },
    { k: 'mc', ref: false, q: 'The same job must reach Secrets Manager privately. Which endpoint?', o: ['an interface endpoint (PrivateLink)', 'a gateway endpoint', 'an internet gateway', 'VPC peering'], w: [null, 'Gateway endpoints exist only for S3 and DynamoDB.', 'That is public internet access.', 'Peering is between VPCs.'], why: 'Most services use interface endpoints.' },
    { k: 'mc', ref: false, q: 'Is a gateway endpoint part of AWS PrivateLink?', o: ['No', 'Yes', 'Only for DynamoDB', 'Only cross-Region'], w: [null, 'PrivateLink is the interface-endpoint technology.', 'Neither gateway endpoint is PrivateLink.', 'Gateway endpoints are same-Region only anyway.'], why: 'Gateway endpoints are route-table targets; PrivateLink uses network interfaces.' },
    { k: 'cls', q: 'Gateway endpoint or interface endpoint?', cats: ['Gateway endpoint', 'Interface endpoint'], items: [['only for S3 and DynamoDB', 0], ['a network interface with a private IP', 1], ['a route-table target', 0], ['has security groups', 1], ['billed per hour and per GB', 1], ['no extra charge', 0]], why: 'Gateway: route target, S3/DynamoDB, free. Interface: ENI, PrivateLink, SGs, paid.' },
    { k: 'mc', ref: false, q: 'A hospital forbids any internet egress from the VPC holding patient data, but jobs must write to S3. Which design?', o: ['No IGW or NAT; an S3 gateway endpoint with an endpoint policy for the hospital\u2019s bucket', 'A NAT gateway with a strict SG', 'A public subnet', 'CloudFront'], w: [null, 'NAT is internet egress, which is forbidden.', 'That is internet access.', 'CloudFront serves users, it is not a VPC path to S3.'], why: 'Endpoint policies can also limit which buckets are reachable.' }] },
  theory: { why: 'Pipelines in private subnets need S3, Glue, Secrets Manager and KMS without going over the internet. Endpoints are how.',
    body: ['A <b>VPC endpoint</b> lets resources in your VPC reach a service privately, without an internet gateway or NAT. <b>Gateway endpoints</b> (S3, DynamoDB) are route-table targets with no extra charge. <b>Interface endpoints</b> are <b>AWS PrivateLink</b>: network interfaces with private IPs in your subnets, with security groups, billed per hour and per GB.',
      'PrivateLink also lets you offer your own service to other VPCs (an endpoint service behind a Network Load Balancer) without peering. Endpoint policies can restrict what can be done through an endpoint.',
      CZ('PrivateLink as a private connection between AWS services, with an example of SageMaker reaching data in RDS through it.', 'PrivateLink connects your VPC to services through interface endpoints. The RDS interface endpoint carries the RDS <b>API</b> (e.g. creating snapshots); connections to the database itself use normal VPC networking. Gateway endpoints, the common S3 path for data engineers, are not PrivateLink.')],
    pro: 'Private subnets, no NAT; S3 via a gateway endpoint, Glue/Secrets Manager/KMS via interface endpoints with private DNS.', q: { q: 'Why can an interface endpoint have a security group but a gateway endpoint cannot?', a: 'An interface endpoint is a network interface, and SGs attach to interfaces. A gateway endpoint is only a route-table target, with no interface.' } },
  T: [
    ['aws6-vpce', 'VPC endpoint', 'A [[private entry from your VPC to a service]], [[without an internet path]].',
      'A VPC endpoint is {a private entry from your VPC to a service}, {with no internet gateway or NAT needed}.', [
      [['a private entry from your VPC to a service', 'a private way from the VPC to a service'], [['a public website address', 'Endpoints keep traffic private.'], ['a link between two VPCs', 'That is peering.'], ['a firewall rule', 'Not a filter.']], { q: 'What does a VPC endpoint remove the need for?', o: ['an internet gateway or NAT to reach the service', 'IAM permissions', 'DNS', 'subnets'], why: 'IAM still applies.' }],
      [['with no internet gateway or NAT needed', 'without going over the internet'], [['with a NAT gateway required', 'The point is to avoid NAT.'], ['over a public IP', 'Private addresses only.'], ['only from public subnets', 'Works from private subnets.']], { q: 'A private subnet with an S3 gateway endpoint and no NAT can reach…', o: ['S3 (in the same Region)', 'the whole internet', 'nothing', 'any Region\u2019s S3'], why: 'Gateway endpoints are same-Region.' }]],
      'Two kinds: gateway (S3, DynamoDB; free; route target) and interface (PrivateLink; ENI; SGs; paid); endpoint policies limit use.',
      { k: 'image', t: 'Memory aid: <b>a staff-only back door</b> from your estate straight into the warehouse (S3), so you never walk out onto the public road.', j: 'a private entry from your VPC to a service with no internet path' }],
    ['aws6-gwep', 'Gateway endpoint', 'A [[route-table target for S3 or DynamoDB]]; [[free and not PrivateLink]].',
      'A gateway endpoint is {a route-table target for S3 or DynamoDB}; it is {free and not part of PrivateLink}.', [
      [['a route-table target for S3 or DynamoDB', 'a route target for S3/DynamoDB'], [['a network interface for any service', 'That is an interface endpoint.'], ['a gateway to the internet', 'That is an IGW.'], ['a route-table target for every service', 'Only S3 and DynamoDB.']], { q: 'Which services have gateway endpoints?', o: ['S3 and DynamoDB', 'every AWS service', 'Secrets Manager and KMS', 'Glue only'], why: 'Only two.' }],
      [['free and not part of PrivateLink', 'no charge, not PrivateLink'], [['paid per hour', 'That is interface endpoints.'], ['part of PrivateLink', 'Common confusion; it is not.'], ['global', 'Same Region only.']], { q: 'Which endpoint has no extra charge?', o: ['gateway endpoint', 'interface endpoint', 'both', 'neither'], why: 'Gateway endpoints are free.' }]],
      'Uses the service\u2019s prefix list as the route destination; same Region; no SGs; reachable only from inside the VPC (not from on-premises or peered VPCs).',
      { k: 'contrast', t: 'Contrast pair: <b>Gateway endpoint = a Gate in the Route table</b> (G for gateway, G for "go this way"), only for the two big stores, S3 and DynamoDB, and free. <b>Interface endpoint = an Interface (a network card with an IP) in your subnet</b>, for many services, and paid.', j: 'a free route-table target for S3 or DynamoDB, not PrivateLink' }],
    ['aws6-ifep', 'Interface endpoint', 'A [[private-IP network interface in your subnet]], powered by [[AWS PrivateLink]].',
      'An interface endpoint is {a network interface with a private IP in your subnet}, powered by {AWS PrivateLink}.', [
      [['a network interface with a private IP in your subnet', 'an ENI with a private IP'], [['a route-table entry', 'That is a gateway endpoint.'], ['a public IP', 'It is private.'], ['a NAT gateway', 'Different component.']], { q: 'What can you attach to an interface endpoint?', o: ['a security group', 'a NACL rule number', 'a hosted zone', 'an IAM group'], why: 'It is an ENI.' }],
      [['AWS PrivateLink', 'PrivateLink'], [['VPC peering', 'Different technology.'], ['the internet gateway', 'No internet path.'], ['Direct Connect', 'That is a dedicated line to on-premises.']], { q: 'PrivateLink is used by…', o: ['interface endpoints', 'gateway endpoints', 'internet gateways', 'NACLs'], why: 'Interface endpoints.' }]],
      'Private DNS makes the public service name resolve to the endpoint IPs; billed per AZ-hour and per GB; reachable from peered VPCs and on-premises.',
      { k: 'origin', t: '<b>Private + Link</b>: AWS PrivateLink literally names what it does: a private link from your VPC to a service. An <b>interface</b> is a network card; the endpoint is one, with an IP in your subnet.', j: 'a private-IP network interface in your subnet, powered by AWS PrivateLink' }]],
  qa: [{ id: 'aws6-q1', q: 'Which endpoint for S3 is free, and which also works from on-premises?', a: 'Gateway endpoint is free (VPC-only); the S3 interface endpoint is paid and reachable from on-premises/peered networks.' },
    { id: 'aws6-q2', q: 'Name three services a DE often reaches through interface endpoints.', a: 'For example Glue, Secrets Manager, KMS, STS, CloudWatch Logs.' }],
  problems: [{ id: 'aws6-p1', kind: 'open', title: 'Cut a NAT bill', scenario: 'A data platform moves 20 TB a month from private subnets to S3 through a NAT gateway. Finance asks why the NAT bill is so high. What do you change?', hint: 'Which endpoint is free?', solution: 'Add an S3 gateway endpoint to the private route tables (the prefix-list route is more specific, so S3 traffic leaves NAT). Optionally add an endpoint policy for the data buckets.', explain: 'NAT charges per GB processed; gateway endpoints have no extra charge.' }]
});

// ---------- Lesson 7 = Coursera 10 "IAM essentials" ----------
const AWS_DENYDEL_POL = '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {"Effect": "Allow", "Action": "s3:*",\n     "Resource": "arn:aws:s3:::clinic-backups/*"},\n    {"Effect": "Deny", "Action": "s3:DeleteObject",\n     "Resource": "arn:aws:s3:::clinic-backups/*"}\n  ]\n}';
AWL({ id: 'aws7', title: 'IAM essentials: who may do what', cz: 'IAM essentials',
  ill: { tables: {}, scenes: [
    { h: 'Users, groups and roles', fig: 'iamwho', say: 'Users are people (or old-style apps) with long-term credentials. Groups collect users so one policy covers them. Roles are assumed for temporary credentials, by a service like Glue, a user, or another account.' },
    { h: 'One policy statement', fig: 'iampol', fp: { json: AWS_GLUE_POL, cap: 'Identity-based policy on glue-etl-role' }, say: 'Effect (Allow or Deny), Action (which API calls), Resource (which ARNs), and optionally Condition. Resource-based policies, such as bucket policies, also name a Principal.' },
    { h: 'How AWS decides', fig: 'iameval', fp: {}, say: 'Everything starts denied. A matching explicit Deny anywhere ends it. Otherwise a matching Allow is needed.' },
    { h: 'Explicit deny wins', fig: 'iameval', fp: { hit: 'deny' }, say: 'Even with Allow s3:* on the bucket, a matching Deny on s3:DeleteObject blocks deletes.' },
    { h: 'A Glue job needs all of these', fig: 'iamglue', say: 'Trust policy (Glue may assume the role), permissions policy (what it may do), and the bucket policy must not deny it.' }],
  qs: [
    { k: 'mc', ref: false, q: 'A policy has <b>no</b> statement mentioning <code>s3:PutObject</code>. A user tries to upload. Result?', o: ['Denied (implicit deny)', 'Allowed', 'Allowed for the root user only', 'An error in the policy'], w: [null, 'Nothing allows it, and the default is deny.', 'The question is about this user; root is a separate identity.', 'Missing actions are normal, not an error.'], why: 'Deny by default.' },
    { k: 'mc', ref: false, q: 'See the policy. Can the user delete a backup?', show: AWX.pol(AWS_DENYDEL_POL, 'Policy on user nurse-app'), o: ['No: the explicit Deny wins', 'Yes: s3:* includes DeleteObject', 'Yes: the Allow comes first', 'Only with MFA'], w: [null, 'It does include it, but the Deny overrides any Allow.', 'Order of statements does not matter.', 'No MFA condition appears here.'], why: 'An explicit deny always overrides an allow.' },
    { k: 'mc', ref: false, q: 'An app on EC2 needs to read S3. Best way to give it credentials?', o: ['An IAM role attached to the instance (instance profile)', 'Put a user\u2019s access keys in the code', 'Use the root user\u2019s keys', 'Make the bucket public'], w: [null, 'Long-term keys in code leak and do not rotate.', 'Never use root for apps.', 'That exposes the data to everyone.'], why: 'Roles give temporary, auto-rotated credentials.' },
    { k: 'cls', q: 'User, group, role or policy?', cats: ['IAM user', 'IAM group', 'IAM role', 'Policy'], items: [['Ada signs in to the console with a password', 0], ['"data-engineers" holds Ada and Bola', 1], ['Glue assumes it and gets temporary credentials', 2], ['a JSON document with Effect, Action, Resource', 3], ['cannot sign in and cannot be a Principal', 1]], why: 'A group is only a container for users; it never signs in.' },
    { k: 'mc', ref: false, q: 'A hospital: nurses may read patient records; billing clerks may read invoices. Neither may delete. Simplest IAM design?', o: ['Two groups, each with its own narrow policy', 'One user shared by all staff', 'Give everyone AdministratorAccess', 'One role for both with s3:*'], w: [null, 'Shared users destroy accountability and audit trails.', 'Far beyond what either job needs.', 'Too broad and mixes two jobs.'], why: 'Groups are like job titles: one policy per job.' }] },
  theory: { why: 'Every pipeline step acts as some identity. "AccessDenied" is the most common data-engineering error, and reading a policy fixes it.',
    body: ['IAM answers two questions: <b>authentication</b> (who are you?) and <b>authorization</b> (what may you do?). Identities: the <b>root user</b>, <b>IAM users</b>, <b>roles</b>; <b>groups</b> collect users. <b>Policies</b> are JSON documents of statements.',
      '<b>Identity-based policies</b> attach to users, groups or roles. <b>Resource-based policies</b> attach to a resource (a bucket policy, a KMS key policy) and name a Principal. A role has a <b>trust policy</b> (who may assume it) and permissions policies (what it may do).',
      'Inside one account: deny by default; an explicit Deny always wins; otherwise an Allow in an identity-based <b>or</b> resource-based policy is enough. SCPs, permissions boundaries and session policies can only narrow it. Cross-account needs Allow on both sides.',
      'Security of the cloud is AWS\u2019s job; security <b>in</b> the cloud (who you let in, what you allow) is yours: the <b>shared responsibility model</b>.',
      CZ('roles, users, groups and policies, explained in prose.', 'that is right, but the decision rule and the parts of a policy need a picture. The flow above is what you will use most.')],
    pro: 'The Glue role trusts glue.amazonaws.com, allows s3:GetObject on de-raw/sales/*, and the bucket policy denies non-TLS access.', q: { q: 'Why is a group not allowed as a Principal?', a: 'A group is not an identity that signs in or makes requests; it only carries policies for its users. Requests are made by users or role sessions.' } },
  T: [
    ['aws7-authn', 'Authentication', '[[Proving who]] is [[making the request]].',
      'Authentication is {proving who} is {making the request}.', [
      [['proving who', 'confirming the identity'], [['deciding what is allowed', 'That is authorization.'], ['encrypting the request', 'That is TLS/KMS.'], ['logging the request', 'That is CloudTrail.']], { q: 'Typing a password plus an MFA code is…', o: ['authentication', 'authorization', 'encryption', 'routing'], why: 'Proving who you are.' }],
      [['making the request', 'sending the request'], [['receiving the reply', 'It is about the caller.'], ['owning the bucket', 'Ownership is a different idea.'], ['paying the bill', 'Not related.']], { q: 'A request signed with an access key proves…', o: ['which identity made it', 'what it may do', 'that the data is encrypted', 'nothing'], why: 'The signature authenticates.' }]],
      'In AWS: console password (+MFA), access keys signing API requests (SigV4), temporary credentials from STS, federation via IAM Identity Center.',
      { k: 'contrast', t: 'Contrast pair: <b>authentication = the gate guard checking your ID</b> ("who are you?"). <b>Authorization = the list of rooms your badge opens</b> ("what may you do?"). Auth-<b>N</b> for "Name", auth-<b>Z</b> for "Zones you may enter".', j: 'proving who is making the request' }],
    ['aws7-authz', 'Authorization', 'Deciding [[what an identity may do]] on [[which resources]].',
      'Authorization is {deciding what that identity may do} on {which resources}.', [
      [['deciding what that identity may do', 'deciding which actions are allowed'], [['proving who the caller is', 'That is authentication.'], ['creating the identity', 'That is setup, not authorization.'], ['encrypting data', 'Not related.']], { q: 'An IAM policy is mainly a tool for…', o: ['authorization', 'authentication', 'DNS', 'caching'], why: 'Policies say what is allowed.' }],
      [['which resources', 'which ARNs'], [['which passwords', 'Passwords are authentication.'], ['which Regions only', 'Resources (ARNs), not just Regions.'], ['which browsers', 'Not related.']], { q: 'Allow s3:GetObject on de-raw/sales/*. The resource part is…', o: ['arn:aws:s3:::de-raw/sales/*', 's3:GetObject', 'Allow', 'the user'], why: 'Resource = ARN.' }]],
      'Evaluated per request: explicit deny > allow > implicit deny; inputs are principal, action, resource and context keys.',
      { k: 'contrast', t: 'Contrast pair (see Authentication): <b>authoriZation = the Zones your badge opens</b>.', j: 'deciding what an identity may do on which resources' }],
    ['aws7-user', 'IAM user', 'An identity with [[long-term credentials]] for [[one person or app]].',
      'An IAM user is {an identity with long-term credentials} for {one person or application}.', [
      [['an identity with long-term credentials', 'an identity with a password and/or access keys'], [['an identity with temporary credentials', 'That is a role session.'], ['a collection of identities', 'That is a group.'], ['the account owner', 'That is the root user.']], { q: 'Which credentials can an IAM user have?', o: ['a console password and access keys', 'only temporary tokens', 'a trust policy', 'a hosted zone'], why: 'Long-term credentials.' }],
      [['one person or application', 'a single person or app'], [['a whole team', 'Share a group, not a user.'], ['an AWS service', 'Services assume roles.'], ['every account', 'Users live in one account.']], { q: 'Three analysts share one IAM user. Problem?', o: ['no accountability: CloudTrail cannot tell who did what', 'none', 'it is faster', 'MFA becomes automatic'], why: 'One identity per person.' }]],
      'AWS recommends IAM Identity Center or roles for people and workloads; users suit special cases; up to 2 access keys and 8 MFA devices each.',
      { k: 'image', t: 'Memory aid: <b>a staff ID card with your photo</b>: it is yours alone and lasts until revoked (long-term).', j: 'an identity with long-term credentials for one person or app' }],
    ['aws7-group', 'IAM group', 'A [[collection of IAM users]] that [[share attached policies]].',
      'An IAM group is {a collection of IAM users} who {share the policies attached to it}.', [
      [['a collection of IAM users', 'a set of users'], [['a collection of roles', 'Groups hold users only.'], ['a collection of groups', 'Groups cannot be nested.'], ['a kind of user that can sign in', 'Groups never sign in.']], { q: 'Can a group contain another group?', o: ['no', 'yes', 'only two levels', 'only in Organizations'], why: 'No nesting.' }],
      [['share the policies attached to it', 'get the group\u2019s permissions'], [['share one password', 'Each user keeps their own credentials.'], ['share one access key', 'Never share keys.'], ['share a trust policy', 'Trust policies are on roles.']], { q: 'Bola joins data-engineers. She gets…', o: ['the group\u2019s permissions, plus her own', 'only the group\u2019s password', 'nothing until reboot', 'root access'], why: 'Permissions add up.' }]],
      'Not a principal (cannot be named in a resource policy); a user can be in up to 10 groups; no nesting.',
      { k: 'image', t: 'Memory aid: <b>a job title</b> such as "Pharmacist". Everyone with the title gets the same keys; the title itself never clocks in.', j: 'a collection of IAM users who share the policies attached to it' }],
    ['aws7-role', 'IAM role', 'An identity [[assumed for temporary credentials]]; it [[has no password or keys]].',
      'An IAM role is {an identity that is assumed for temporary credentials}; it {has no password or long-term keys}.', [
      [['an identity that is assumed for temporary credentials', 'an identity you assume to get temporary credentials'], [['a user with a password', 'Roles have no password.'], ['a group of users', 'That is a group.'], ['a JSON policy', 'A role HAS policies; it is an identity.']], { q: 'Glue reads S3 using…', o: ['a role it assumes', 'a user\u2019s password', 'the root user', 'a group'], why: 'Services assume roles.' }],
      [['has no password or long-term keys', 'has no long-term credentials'], [['has a permanent access key', 'No long-term keys.'], ['has a password', 'No password.'], ['has an MFA device', 'MFA belongs to the person assuming it.']], { q: 'Who decides who may assume a role?', o: ['its trust policy', 'its group', 'the NACL', 'DNS'], why: 'The trust policy names principals.' }]],
      'Trust policy + permissions policies; STS issues credentials that expire (1 h default, up to 12 h max session); used by services, cross-account access and federation.',
      { k: 'image', t: 'Memory aid: <b>a role in a play</b>. An actor puts on the costume (assumes the role), plays for a while (temporary), then takes it off. The costume has no name tag of its own.', j: 'an identity assumed for temporary credentials, with no password or keys' }],
    ['aws7-policy', 'Policy', 'A [[JSON document]] that [[allows or denies actions on resources]].',
      'A policy is {a JSON document} that {allows or denies actions on resources}.', [
      [['a JSON document', 'a document written in JSON'], [['a password rule', 'Password policy is a different, account setting.'], ['a Python script', 'Policies are JSON.'], ['a route table', 'Not network.']], { q: 'Which is a policy element?', o: ['"Effect"', '"Destination"', '"TTL"', '"Port"'], why: 'Effect, Action, Resource, Condition, Principal.' }],
      [['allows or denies actions on resources', 'grants or blocks actions on resources'], [['creates users', 'Policies do not create identities.'], ['encrypts objects', 'Not encryption.'], ['routes packets', 'Not network.']], { q: '"Effect": "Deny", "Action": "s3:DeleteObject". It…', o: ['blocks deletes that match', 'allows deletes', 'deletes objects', 'does nothing'], why: 'Effect Deny.' }]],
      'Types: identity-based (managed or inline), resource-based, permissions boundaries, SCPs/RCPs, session policies, ACLs; statements of Effect/Action/Resource/Condition(/Principal).',
      { k: 'image', t: 'Memory aid: <b>a house rule sheet</b> on the wall: "Allow: kitchen. Deny: the safe." Written down, so anyone (AWS) can check it.', j: 'a JSON document that allows or denies actions on resources' }],
    ['aws7-exdeny', 'Explicit deny', 'A [[matching Deny statement]] that [[overrides every Allow]].',
      'An explicit deny is {a matching Deny statement}, and it {overrides every Allow}.', [
      [['a matching Deny statement', 'a Deny that matches the request'], [['the absence of an Allow', 'That is an implicit deny.'], ['a Deny that does not match', 'Only a matching one counts.'], ['an error message', 'It is a policy statement.']], { q: 'No policy mentions the action. That is…', o: ['an implicit deny', 'an explicit deny', 'an allow', 'an error'], why: 'Explicit means written.' }],
      [['overrides every Allow', 'beats any Allow'], [['is overridden by an Allow', 'Never.'], ['applies only to root', 'It applies to any principal the statement matches, in any policy type.'], ['only works in bucket policies', 'In any policy type.']], { q: 'Allow s3:* and Deny s3:DeleteObject. Delete is…', o: ['denied', 'allowed', 'random', 'allowed with tags'], why: 'Deny wins.' }]],
      'Wins across all policy types in the evaluation; common use: guardrails such as "deny when aws:SecureTransport is false".',
      { k: 'image', t: 'Memory aid: <b>a red card</b>. However many yellow-to-green "allows" you collect, one red card sends you off.', j: 'a matching Deny statement that overrides every Allow' }],
    ['aws7-rbp', 'Resource-based policy', 'A policy [[attached to a resource]] that [[names who may use it]].',
      'A resource-based policy is {attached to a resource} and {names the principals who may use it}.', [
      [['attached to a resource', 'on the resource itself'], [['attached to a user', 'That is identity-based.'], ['attached to a group', 'Identity-based.'], ['attached to a subnet', 'That is a NACL.']], { q: 'Which is a resource-based policy?', o: ['an S3 bucket policy', 'a policy on a role', 'a policy on a group', 'a route table'], why: 'Bucket, KMS key, SQS queue policies…' }],
      [['names the principals who may use it', 'has a Principal element'], [['has no Principal', 'Identity-based ones have none; resource-based ones need one.'], ['names subnets', 'Not network.'], ['names passwords', 'No.']], { q: 'Which element appears in a bucket policy but not in a policy on a role?', o: ['Principal', 'Effect', 'Action', 'Resource'], why: 'Principal says who.' }]],
      'Enables cross-account access (both sides must allow); examples: bucket policies, KMS key policies, role trust policies, Lambda resource policies.',
      { k: 'contrast', t: 'Contrast pair: an <b>identity-based policy is the badge you wear</b> ("I may open room 3"). A <b>resource-based policy is the sign on the door</b> ("Ada and Glue may enter").', j: 'a policy attached to a resource that names who may use it' }]],
  qa: [{ id: 'aws7-q1', q: 'Put the evaluation in three steps.', a: '1) Any matching explicit Deny → denied. 2) Any matching Allow (identity- or resource-based, same account) → allowed. 3) Otherwise implicit deny.' },
    { id: 'aws7-q2', q: 'Trust policy vs permissions policy on a role?', a: 'Trust: who may assume the role. Permissions: what the role may do once assumed.' },
    { id: 'aws7-q3', q: 'Shared responsibility for IAM?', a: 'AWS secures the IAM service; you decide identities, policies, MFA and key handling.' }],
  code: [{ id: 'aws7-c1', task: 'Allow reading objects under de-raw/sales/ only', lang: 'json', code: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "[[Allow]]",\n    "Action": "[[s3:GetObject]]",\n    "Resource": "arn:aws:s3:::[[de-raw/sales/*]]"\n  }]\n}' }],
  problems: [{ id: 'aws7-p1', kind: 'open', title: 'AccessDenied in the Glue job', scenario: 'A Glue job role has Allow s3:GetObject on arn:aws:s3:::de-raw/* . The bucket policy has Deny s3:* for all principals when aws:SecureTransport is false. The job reads over HTTPS. It still fails with AccessDenied, and the objects are SSE-KMS encrypted. Why?', hint: 'Two locks.', solution: 'The role also needs kms:Decrypt on the KMS key (and the key policy must allow it, e.g. via IAM). The S3 allow alone is not enough for SSE-KMS objects.', explain: 'HTTPS satisfies the bucket policy; the missing piece is the KMS permission (covered again in the KMS lesson).' }]
});

// ---------- Lesson 8 = Coursera 11 "Least privilege" ----------
const AWS_ATHENA_POL = '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": ["athena:StartQueryExecution",\n               "athena:GetQueryResults"],\n    "Resource": "arn:aws:athena:eu-west-1:111122223333:workgroup/analysts"\n  }]\n}';
const AWS_COND_POL = '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::bank-reports/*",\n    "Condition": {"IpAddress": {"aws:SourceIp": "198.51.100.0/24"}}\n  }]\n}';
Object.assign(ILL_FIGS, {
  creep: () => AWX.hops([['📅', 'Jan: analyst joins', 'read sales tables'], ['📅', 'Mar: one-off project', '+ write to a staging bucket'], ['📅', 'Jun: helps on-call', '+ restart Glue jobs'], ['📅', 'Oct: back to analysis only', 'still holds all three: scope creep', 'aw-key']]) + '<div class="figcap">Review permissions regularly. IAM Access Analyzer can show unused access and generate a policy from real activity in CloudTrail.</div>'
});
AWL({ id: 'aws8', title: 'Least privilege', cz: 'Least privilege',
  ill: { tables: {}, scenes: [
    { h: 'Broad: everything in S3, everywhere', fig: 'iampol', fp: { json: AWS_ALL_POL, cap: '⚠️ Too broad: s3:* on *' }, say: 'This allows every S3 action on every bucket in the account, including deleting buckets and changing bucket policies.' },
    { h: 'Narrow: one action, one prefix', fig: 'iampol', fp: { json: AWS_GLUE_POL, cap: '✅ Least privilege: what the job uses' }, say: 'The job only reads objects under de-raw/sales/. Nothing else is allowed, so a leak or a bug can do far less damage.' },
    { h: 'Add a condition', fig: 'iampol', fp: { json: AWS_COND_POL, cap: 'Allow only from the office network' }, say: 'A Condition must be true for the statement to apply. Here: only from the office IP range.' },
    { h: 'Scope creep', fig: 'creep', say: 'Permissions pile up as people change tasks, unless someone removes them.' }],
  qs: [
    { k: 'mc', ref: false, q: 'An analyst only runs Athena queries in the "analysts" workgroup. Which policy follows least privilege?', o: ['Allow the two Athena query actions on that workgroup\u2019s ARN (plus read on its data and results buckets)', 'Allow athena:* on *', 'AdministratorAccess', 'Allow s3:* on *'], w: [null, 'Every Athena action on every workgroup is more than the job needs.', 'Everything in the account.', 'Not even the right service, and far too broad.'], why: 'Only the actions and resources the job uses.' },
    { k: 'mc', ref: false, q: 'The leaked keys belong to a user with only <code>s3:GetObject</code> on <code>bank-reports/*</code>. What can an attacker do?', o: ['Read objects in bank-reports, nothing more', 'Delete the bucket', 'Create new users', 'Nothing at all'], w: [null, 'Delete needs s3:DeleteBucket, which is not allowed.', 'Needs iam:CreateUser.', 'Reading is still a real leak.'], why: 'Least privilege limits the blast radius; it does not reduce it to zero.' },
    { k: 'mc', ref: false, q: 'Which line makes the first policy dangerous?', show: AWX.pol(AWS_ALL_POL, ''), o: ['"Action": "s3:*" together with "Resource": "*"', '"Version"', '"Effect": "Allow"', 'the brackets'], w: [null, 'Version is the policy language date, harmless.', 'Allow is needed; it is the scope that is too wide.', 'Syntax, not scope.'], why: 'Every action × every resource.' },
    { k: 'mc', ref: false, q: 'A pharmacy: the cashier records sales; the pharmacist also dispenses controlled drugs. Least privilege means…', o: ['the cashier gets only "record sale"; the pharmacist gets both', 'both get everything, to save time', 'both get only "record sale"', 'one shared login'], w: [null, 'Convenience is how breaches spread.', 'Then the pharmacist cannot do the job.', 'Shared logins break accountability.'], why: 'Each role gets what its job needs.' }] },
  theory: { why: 'Credentials leak and code has bugs. Least privilege decides how bad that day is.',
    body: ['<b>Least privilege</b>: give each identity only the permissions its task needs. Scope three things: <b>actions</b> (service:Operation), <b>resources</b> (ARNs, down to a prefix), <b>conditions</b> (IP range, MFA, TLS, tags, time).',
      'Start small and add when something is denied. Use access levels (List, Read, Write, Permissions management, Tagging) to judge risk. Watch for <b>scope creep</b> and review regularly with IAM Access Analyzer (unused access, policy generation) and the IAM policy simulator. Protect backups with an explicit Deny.',
      CZ('an example action <code>aws-portal:ViewBilling</code>.', 'that action was retired in July 2023. Billing access now uses fine-grained actions such as <code>billing:GetBillingData</code> or <code>ce:GetCostAndUsage</code>.')],
    pro: 'Policies are scoped to bucket prefixes and workgroups; Access Analyzer reviews unused access each quarter.', q: { q: 'Why "start small and add" rather than "start broad and remove"?', a: 'Broad grants are rarely cut back (scope creep), and the risk exists from day one. A denied call is a visible, safe failure; an over-grant is an invisible risk.' } },
  T: [
    ['aws8-lp', 'Least privilege', 'Giving [[only the permissions a task needs]], [[nothing more]].',
      'Least privilege means granting {only the permissions a task needs}, and {nothing more}.', [
      [['only the permissions a task needs', 'just what the job requires'], [['all permissions, then removing some', 'That is the opposite approach.'], ['the permissions a team might need later', 'Future needs are added when they arrive.'], ['read-only access to everything', 'Read-all is still more than most tasks need.']], { q: 'A job reads one prefix. Least-privilege resource?', o: ['arn:aws:s3:::de-raw/sales/*', '*', 'arn:aws:s3:::*', 'arn:aws:s3:::de-raw*'], why: 'Exactly the prefix used.' }],
      [['nothing more', 'no extra permissions'], [['plus admin for emergencies', 'Emergency access uses a separate, audited role.'], ['plus delete to clean up', 'Only if the task deletes.'], ['plus s3:* for convenience', 'Convenience is the enemy here.']], { q: 'Least privilege reduces…', o: ['the damage a compromised identity can do', 'the number of users', 'the AWS bill', 'network latency'], why: 'Blast radius.' }]],
      'Applied to actions, resources and conditions; supported by Access Analyzer (unused access, policy generation from CloudTrail), access levels and permissions boundaries.',
      { k: 'image', t: 'Memory aid: <b>the hotel key card</b>: it opens your room and the gym, for your dates only. Not every room, not forever.', j: 'granting only the permissions a task needs, nothing more' }],
    ['aws8-creep', 'Scope creep', 'Permissions [[piling up beyond]] what the job [[still uses]].',
      'Scope creep is {permissions piling up} {beyond what the job still uses}.', [
      [['permissions piling up', 'permissions accumulating'], [['permissions expiring', 'The problem is that they do not expire.'], ['users being deleted', 'Opposite problem.'], ['policies becoming invalid', 'They stay valid, that is the risk.']], { q: 'Cure for scope creep?', o: ['regular reviews (e.g. Access Analyzer unused access)', 'more groups', 'longer passwords', 'bigger instances'], why: 'Remove what is unused.' }],
      [['beyond what the job still uses', 'more than the current job needs'], [['below what the job needs', 'That causes denials, not creep.'], ['exactly what the job uses', 'That is least privilege.'], ['in another account', 'Not the point.']], { q: 'Old project write access still on an analyst a year later is…', o: ['scope creep', 'least privilege', 'MFA', 'an explicit deny'], why: 'Leftover access.' }]],
      'Common with long-lived users and shared roles; time-bound grants and periodic certification counter it.',
      { k: 'image', t: 'Memory aid: <b>a keyring that only gets heavier</b>: a key for every old flat you ever lived in.', j: 'permissions piling up beyond what the job still uses' }],
    ['aws8-arn', 'ARN', 'The [[unique name]] that [[identifies one AWS resource]].',
      'An ARN is {the unique name} that {identifies one AWS resource}.', [
      [['the unique name', 'a unique identifier string'], [['a password', 'Not secret.'], ['an IP address', 'ARNs are not network addresses.'], ['a policy', 'Policies USE ARNs.']], { q: 'Which is an ARN?', o: ['arn:aws:s3:::de-raw', 'de-raw.s3.amazonaws.com', '10.0.1.5', 's3:GetObject'], why: 'Starts with arn:.' }],
      [['identifies one AWS resource', 'names one resource'], [['identifies a user\u2019s password', 'No.'], ['identifies a Region only', 'It names a resource (a Region field may be part of it).'], ['identifies an API action', 'That is an action like s3:GetObject.']], { q: 'In a policy, ARNs go in…', o: ['"Resource" (and "Principal")', '"Action"', '"Effect"', '"Version"'], why: 'They name things.' }]],
      'Format arn:partition:service:region:account-id:resource; S3 ARNs omit Region and account; wildcards * allowed in policies.',
      { k: 'split', t: '<b>ARN = Amazon Resource Name</b>: literally a resource\u2019s full name. Memory aid: read it like an address: arn : aws : service : region : account : resource.', j: 'the unique name that identifies one AWS resource' }],
    ['aws8-cond', 'Condition', 'A [[policy check]] that [[must be true]] for the statement to apply.',
      'A Condition is {a check in a policy statement} that {must be true for the statement to apply}.', [
      [['a check in a policy statement', 'an extra test inside a statement'], [['a whole separate policy', 'It is an element inside a statement.'], ['a network ACL rule', 'Not network.'], ['an error state', 'Not an error.']], { q: 'Which is a condition key?', o: ['aws:SourceIp', 's3:GetObject', 'arn:aws:s3:::x', 'Allow'], why: 'Context keys such as aws:SourceIp, aws:MultiFactorAuthPresent, aws:SecureTransport.' }],
      [['must be true for the statement to apply', 'has to be met or the statement is skipped'], [['makes the statement always apply', 'It narrows when it applies.'], ['reverses Allow into Deny', 'It does not flip the effect.'], ['is optional advice', 'AWS enforces it.']], { q: 'Allow GetObject with aws:SourceIp 198.51.100.0/24. A request from home (203.0.113.9)?', o: ['implicit deny: the condition is false', 'allowed', 'explicit deny', 'error'], why: 'Statement does not apply; nothing else allows.' }]],
      'Operators like StringEquals, IpAddress, Bool, DateLessThan; multiple keys are ANDed, multiple values ORed.',
      { k: 'image', t: 'Memory aid: <b>"only if"</b>. "You may take the car, <b>only if</b> you are home by 10." The permission exists only while the condition holds.', j: 'a check that must be true for a policy statement to apply' }],
    ['aws8-imdeny', 'Implicit deny', 'The [[default result]] when [[nothing allows]] the request.',
      'An implicit deny is {the default result} when {no policy allows the request}.', [
      [['the default result', 'what happens by default'], [['a Deny you write', 'That is explicit.'], ['an Allow', 'Opposite.'], ['an error in JSON', 'Not an error.']], { q: 'A brand-new IAM user with no policies tries s3:ListBucket.', o: ['implicit deny', 'explicit deny', 'allowed', 'only console allowed'], why: 'Nothing allows it.' }],
      [['no policy allows the request', 'nothing grants it'], [['a policy denies it', 'Explicit deny.'], ['the user has MFA', 'Not related.'], ['the bucket is private', 'Private buckets still allow principals with Allow.']], { q: 'An implicit deny can be overcome by…', o: ['adding a matching Allow', 'nothing', 'deleting the user', 'MFA'], why: 'Unlike an explicit deny.' }]],
      'Unlike an explicit deny it can be overridden by an Allow; SCP/boundary absence of allow also implicitly denies.',
      { k: 'contrast', t: 'Contrast pair: <b>implicit deny = "not on the guest list"</b> (add your name and you are in). <b>Explicit deny = "banned"</b> (no guest list can get you in).', j: 'the default result when no policy allows the request' }]],
  qa: [{ id: 'aws8-q1', q: 'Name the three things you scope in least privilege.', a: 'Actions, resources (ARNs), conditions.' },
    { id: 'aws8-q2', q: 'Which tools help you right-size permissions?', a: 'IAM Access Analyzer (unused access, policy generation), last-accessed info, IAM policy simulator.' }],
  code: [{ id: 'aws8-c1', task: 'Allow reading bank-reports only from the office range', lang: 'json', code: '"Condition": {"[[IpAddress]]": {"[[aws:SourceIp]]": "198.51.100.0/24"}}' }],
  problems: [{ id: 'aws8-p1', kind: 'open', title: 'Tighten a school\u2019s policy', scenario: 'The school\u2019s grading app role has Allow s3:* on *. It only reads and writes grades under arn:aws:s3:::school-data/grades/. Rewrite the policy idea and protect the bucket from deletion.', hint: 'Actions, resources, and a guard rail.', solution: 'Allow s3:GetObject and s3:PutObject on arn:aws:s3:::school-data/grades/* (plus s3:ListBucket on arn:aws:s3:::school-data with a prefix condition if it lists). Add an explicit Deny of s3:DeleteBucket on arn:aws:s3:::school-data.', explain: 'Two actions on one prefix replace every action on every resource; the deny is a guard rail even if someone later adds broad access.' }]
});

// ---------- Lesson 9 = Coursera 14 "Securing access with MFA" ----------
const AWS_MFA_POL = '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Deny",\n    "Action": "s3:DeleteObject",\n    "Resource": "arn:aws:s3:::bank-records/*",\n    "Condition": {"BoolIfExists":\n      {"aws:MultiFactorAuthPresent": "false"}}\n  }]\n}';
Object.assign(ILL_FIGS, {
  mfa2: () => '<div class="aw-lanes"><div class="aw-lane"><div class="aw-lab">🔑 Something you know</div><div class="small">password</div></div><div class="aw-lane"><div class="aw-lab">📱 Something you have</div><div class="small">a passkey or security key (FIDO), an authenticator app (new 6-digit code every 30 s), or a hardware TOTP token</div></div></div><div class="figcap">Two different kinds of factor. A stolen password alone no longer opens the door.</div>'
});
AWL({ id: 'aws9', title: 'Multi-factor authentication (MFA)', cz: 'Securing access with MFA',
  ill: { tables: {}, scenes: [
    { h: 'Two locks of different kinds', fig: 'mfa2', say: 'MFA asks for a second factor of a different kind: something you have, as well as something you know.' },
    { h: 'Requiring MFA in a policy', fig: 'iampol', fp: { json: AWS_MFA_POL, cap: 'Deny deletes unless the session used MFA' }, say: 'aws:MultiFactorAuthPresent is true only when the request\u2019s credentials came from an MFA sign-in. BoolIfExists also catches long-term access keys, where the key is absent.' }],
  qs: [
    { k: 'mc', ref: false, q: 'Which pair is real multi-factor?', o: ['password + code from an authenticator app', 'password + security question', 'two passwords', 'password + username'], w: [null, 'Both are "something you know".', 'Same kind twice.', 'A username is not secret.'], why: 'Factors must be of different kinds.' },
    { k: 'mc', ref: false, q: 'See the policy. A user signs in without MFA and tries to delete a record.', show: AWX.pol(AWS_MFA_POL, ''), o: ['Denied', 'Allowed', 'Allowed once', 'Error'], w: [null, 'MultiFactorAuthPresent is false, so the Deny matches.', 'There is no "once" in IAM.', 'The policy is valid.'], why: 'Explicit deny with a condition that is true.' },
    { k: 'mc', ref: false, q: 'Which MFA type can you no longer enable for IAM users?', o: ['SMS text message', 'authenticator app', 'FIDO security key / passkey', 'hardware TOTP token'], w: [null, 'Supported (virtual MFA).', 'Supported, and the most phishing-resistant.', 'Supported.'], why: 'AWS ended support for enabling SMS MFA.' },
    { k: 'mc', ref: false, q: 'A bank teller\u2019s login: which adds the most protection against phishing?', o: ['a FIDO security key (passkey)', 'a longer password', 'a code sent by SMS', 'a security question'], w: [null, 'Long passwords can still be phished.', 'SMS codes can be phished or SIM-swapped.', 'Easily guessed or researched.'], why: 'FIDO keys check the real site, so a fake site gets nothing usable.' }] },
  theory: { why: 'Leaked or phished passwords are the classic way into cloud accounts. MFA blocks most of them.',
    body: ['<b>MFA</b> = sign-in needs a second factor besides the password. AWS supports <b>passkeys and FIDO security keys</b>, <b>virtual MFA</b> (an authenticator app), and <b>hardware TOTP tokens</b>. Up to 8 MFA devices per root or IAM user.',
      'Protect the <b>root user</b> first: it has full access and IAM policies cannot limit it (in AWS Organizations, SCPs can limit a member account\u2019s root). Require MFA for sensitive actions with <code>aws:MultiFactorAuthPresent</code>.',
      CZ('SMS MFA is available but discouraged.', 'AWS has ended support for enabling SMS MFA. Use a passkey/security key, an authenticator app or a hardware token.')],
    pro: 'Root has a FIDO key in the safe; humans sign in through Identity Center with MFA; deletes on bank records need an MFA session.', q: { q: 'Why does the policy use BoolIfExists, not Bool?', a: 'Requests signed with long-term access keys have no MultiFactorAuthPresent key. With Bool the condition would not match them, so the Deny would not apply. BoolIfExists treats a missing key as matching.' } },
  T: [
    ['aws9-mfa', 'MFA', 'Sign-in that needs [[a second factor]] [[besides the password]].',
      'MFA is a sign-in that needs {a second factor of a different kind} {besides the password}.', [
      [['a second factor of a different kind', 'another kind of proof'], [['a second password', 'Same kind; not MFA.'], ['a longer password', 'Still one factor.'], ['a security question', 'Also "something you know".']], { q: 'Which is a second factor?', o: ['a code from an authenticator app', 'your username', 'your date of birth', 'a second password'], why: 'Something you have.' }],
      [['besides the password', 'as well as the password'], [['instead of a username', 'Usernames are not factors.'], ['instead of IAM policies', 'MFA proves identity; policies still decide access.'], ['only for root', 'For any user.']], { q: 'After MFA sign-in, what still decides what you can do?', o: ['IAM policies', 'nothing', 'the MFA device', 'DNS'], why: 'MFA is authentication; policies are authorization.' }]],
      'Types in IAM: passkeys/FIDO security keys, virtual MFA (TOTP apps), hardware TOTP tokens; SMS no longer enabled; up to 8 devices per user; condition key aws:MultiFactorAuthPresent.',
      { k: 'split', t: '<b>Multi-Factor Authentication</b>: multi (more than one) factor (kind of proof). Memory aid: picture <b>a door with a key lock AND a fingerprint pad</b>: a copied key alone is useless.', j: 'sign-in that needs a second factor of a different kind besides the password' }],
    ['aws9-root', 'Root user', 'The [[account\u2019s original identity]] with [[full access]]; protect it with MFA.',
      'The root user is {the account\u2019s original sign-in identity}, with {full access to everything in the account}.', [
      [['the account\u2019s original sign-in identity', 'the email that created the account'], [['an IAM user with AdministratorAccess', 'Different: root is not an IAM user and IAM policies cannot limit it.'], ['an IAM group', 'Groups cannot sign in.'], ['a service role', 'Not root.']], { q: 'Which identity signs in with the account\u2019s email address?', o: ['root user', 'any IAM user', 'a role', 'a group'], why: 'Root uses the account email.' }],
      [['full access to everything in the account', 'unrestricted access'], [['read-only access', 'Root has full access.'], ['only billing access', 'Far more.'], ['access limited by IAM policies', 'IAM policies do not limit root (SCPs can, for member accounts).']], { q: 'Best daily practice for root?', o: ['MFA on, no access keys, use it only for root-only tasks', 'use it daily', 'share it with the team', 'create root access keys for scripts'], why: 'Lock it away.' }]],
      'Some tasks need root (e.g. change account settings, close the account); AWS enforces MFA for root in many account types; prefer no root access keys.',
      { k: 'image', t: 'Memory aid: <b>the root of a tree</b>: everything grows from it, so if it rots, the whole tree falls. Keep it buried (locked away) and do daily work in the branches (IAM).', j: 'the account\u2019s original identity with full access, protected with MFA' }],
    ['aws9-vmfa', 'Virtual MFA device', 'An [[authenticator app]] that shows [[a new one-time code every 30 seconds]].',
      'A virtual MFA device is {an authenticator app} that shows {a new one-time code every 30 seconds}.', [
      [['an authenticator app', 'an app on your phone'], [['a text message', 'SMS is not a virtual MFA device and can no longer be enabled.'], ['a USB key', 'That is a FIDO security key.'], ['an email link', 'Not an AWS MFA type.']], { q: 'Setting it up, AWS asks for…', o: ['two consecutive codes from the app', 'your password twice', 'an SMS code', 'a phone call'], why: 'Proves the app is in sync.' }],
      [['a new one-time code every 30 seconds', 'a time-based one-time code'], [['the same code every time', 'Codes change.'], ['a code every day', 'Every 30 seconds.'], ['a password', 'A short-lived code, not a password.']], { q: 'TOTP stands for…', o: ['time-based one-time password', 'total one-time pass', 'token of the password', 'trusted online token'], why: 'Time-based.' }]],
      'Uses TOTP (RFC 6238): a shared secret from the QR code + the clock; keep a backup device registered (up to 8).',
      { k: 'split', t: 'Memory aid: <b>virtual = it lives in software</b>, no physical gadget. The 30-second code is like a <b>bus ticket that expires as you board</b>.', j: 'an authenticator app showing a new one-time code every 30 seconds' }],
    ['aws9-akey', 'Access key', 'A [[long-term ID and secret]] that [[signs API and CLI requests]].',
      'An access key is {a long-term key ID and secret} that {signs API and CLI requests} as one IAM user.', [
      [['a long-term key ID and secret', 'a long-term key ID plus secret key'], [['a temporary token from a role', 'Role credentials are temporary; access keys are long-term.'], ['a console password', 'Passwords are for the console.'], ['a KMS key', 'KMS keys encrypt data; access keys sign requests.']], { q: 'When can you see the secret access key?', o: ['only once, when it is created', 'any time in the console', 'in CloudTrail', 'by asking root'], why: 'Lost it? Create a new key and delete the old one.' }],
      [['signs API and CLI requests', 'authenticates programmatic calls'], [['signs in to the console', 'That is a password (+ MFA).'], ['encrypts S3 objects', 'Not encryption.'], ['opens network ports', 'Not network.']], { q: 'A script on a laptop calls S3 with the CLI. Its credentials are typically…', o: ['an access key (or, better, temporary credentials)', 'the console password', 'a KMS key', 'an ARN'], why: 'Programmatic access.' }]],
      'Max 2 per user (for rotation); prefer roles or IAM Identity Center temporary credentials; never commit keys to code; creating one needs iam:CreateAccessKey, not root.',
      { k: 'contrast', t: 'Contrast pair: an <b>access key</b> is like <b>a house key you copy for a robot</b> (long-term, works until you change the locks). A <b>role\u2019s credentials</b> are <b>a visitor badge</b> that expires today.', j: 'a long-term key ID and secret that signs API and CLI requests' }]],
  qa: [{ id: 'aws9-q1', q: 'Which MFA types does IAM support today?', a: 'Passkeys/FIDO security keys, virtual MFA apps, hardware TOTP tokens.' },
    { id: 'aws9-q2', q: 'Can an IAM policy restrict the root user?', a: 'No. In AWS Organizations an SCP can restrict a member account\u2019s root.' }],
  problems: [{ id: 'aws9-p1', kind: 'open', title: 'A clinic\u2019s admin logins', scenario: 'A clinic has a root user (no MFA) used daily, and three admins sharing one IAM user. What do you change?', hint: 'Root, people, MFA.', solution: 'Put MFA (ideally a FIDO key) on root and stop using it daily; create one identity per admin (IAM Identity Center or IAM users) in an admins group, each with MFA; require MFA for sensitive actions.', explain: 'Root is the highest-risk identity; shared logins break accountability.' }]
});

// ---------- Lesson 10 = Coursera 16 "Understanding KMS" ----------
Object.assign(ILL_FIGS, {
  kmstypes: () => '<div class="aw-lanes"><div class="aw-lane"><div class="aw-lab">🔑 Symmetric (the default)</div><div class="small">one AES-256 key encrypts and decrypts; it never leaves KMS unencrypted. Used by S3, Glue, Redshift, EBS…</div></div><div class="aw-lane"><div class="aw-lab">🔑🔓 Asymmetric</div><div class="small">an RSA or ECC key pair: the public key can be downloaded; the private key stays in KMS. For signing, or encryption by parties outside AWS.</div></div></div>' +
    '<table class="mini aw-rtab"><tr><th>Who manages</th><th>Key policy</th><th>Rotation</th></tr><tr><td>Customer managed key</td><td>you</td><td>optional automatic (90–2,560 days, default 365) + on demand</td></tr><tr><td>AWS managed key (aws/s3…)</td><td>AWS</td><td>automatic every year</td></tr><tr><td>AWS owned key</td><td>AWS, not in your account</td><td>AWS decides</td></tr></table>'
});
AWL({ id: 'aws10', title: 'AWS KMS: keys that never leave', cz: 'Reading: Understanding KMS',
  ill: { tables: {}, scenes: [
    { h: 'Kinds of keys', fig: 'kmstypes', say: 'KMS keys are symmetric (one key) or asymmetric (a pair). Who manages them decides who controls the policy and rotation.' },
    { h: 'Envelope encryption (how S3 uses KMS)', fig: 'kmsenv', say: 'KMS does not encrypt your big files itself. It hands out a data key, S3 encrypts the object with it, and stores the data key encrypted under the KMS key.' }],
  qs: [
    { k: 'mc', ref: false, q: 'A Glue role has <code>s3:GetObject</code> on the bucket, but objects are SSE-KMS encrypted with a customer managed key. The role has no KMS permissions. Result?', o: ['AccessDenied: it also needs kms:Decrypt on the key', 'It reads fine', 'It reads but the data is garbled', 'S3 decrypts with root'], w: [null, 'S3 must call KMS Decrypt as the requester; without permission it fails.', 'S3 never returns ciphertext for SSE-KMS reads; it fails instead.', 'Root plays no part.'], why: 'Two locks: S3 permission and KMS permission.' },
    { k: 'mc', ref: false, q: 'Which keys can you set to rotate automatically?', o: ['symmetric customer managed keys', 'asymmetric keys', 'keys with imported material', 'AWS owned keys'], w: [null, 'Asymmetric KMS keys do not support automatic rotation.', 'Imported key material must be rotated manually.', 'AWS controls those, not you.'], why: 'AWS managed keys rotate yearly on their own.' },
    { k: 'mc', ref: false, q: 'After rotation, can old files still be decrypted?', o: ['Yes: KMS keeps old key material for decryption', 'No: re-encrypt everything first', 'Only within 24 hours', 'Only by AWS Support'], w: [null, 'Rotation adds new material; old material is kept.', 'No such window.', 'You decrypt as usual.'], why: 'The key ID stays the same; KMS picks the right material.' },
    { k: 'mc', ref: false, q: 'A clinic encrypts patient exports with a KMS key in eu-west-1 and copies them to us-east-1. A job there must decrypt. Simplest option?', o: ['a multi-Region key (a replica in us-east-1)', 'copy the key file by email', 'make the key public', 'use the same key ID in us-east-1'], w: [null, 'KMS keys cannot be exported in plaintext.', 'Key policies never allow "public".', 'A single-Region key exists only in its Region.'], why: 'Multi-Region keys share key material across Regions.' }] },
  theory: { why: 'Encryption at rest in S3, Redshift, Glue and RDS uses KMS. Knowing it turns "AccessDenied" with SSE-KMS from a mystery into a two-minute fix.',
    body: ['<b>AWS KMS</b> creates and controls keys and uses them inside the service; symmetric keys never leave KMS unencrypted. Every KMS key has exactly one <b>key policy</b>; IAM policies count only if the key policy allows it. Every use is logged in CloudTrail. Keys are regional, unless you create a <b>multi-Region key</b>.',
      'AWS services use <b>envelope encryption</b>: a data key encrypts the data; the KMS key encrypts the data key. Reading needs <code>kms:Decrypt</code>.',
      CZ('rotation happens automatically each year, and multi-Region apps need separate keys in each Region.', 'for customer managed keys you choose a rotation period from 90 to 2,560 days (default 365) and can also rotate on demand; AWS managed keys rotate every year. Multi-Region keys let one key be used in several Regions. "Customer master key (CMK)" is the old name for a KMS key.')],
    pro: 'Raw data is SSE-KMS with a customer managed key; the Glue role has kms:Decrypt via the key policy; rotation yearly.', q: { q: 'Why not let KMS encrypt a 5 GB file directly?', a: 'KMS Encrypt accepts at most 4 KB of data and every call is a network round trip. Envelope encryption encrypts locally with a data key and only sends the small data key to KMS.' } },
  T: [
    ['aws10-kms', 'KMS key', 'A key [[kept inside KMS]] that [[never leaves it unencrypted]].',
      'A KMS key is {a key kept inside AWS KMS} that {never leaves it unencrypted}.', [
      [['a key kept inside AWS KMS', 'a key held by KMS'], [['a password file', 'Not a file you hold.'], ['an access key', 'Access keys sign requests.'], ['an SSH key pair', 'Different thing.']], { q: 'Where is a symmetric KMS key used?', o: ['inside KMS only', 'on your laptop after download', 'in the S3 bucket', 'in DNS'], why: 'You call KMS to use it.' }],
      [['never leaves it unencrypted', 'cannot be exported in plaintext'], [['can be downloaded any time', 'Symmetric key material cannot be exported.'], ['is stored in S3', 'No.'], ['is emailed to admins', 'No.']], { q: 'An asymmetric KMS key: what can you download?', o: ['the public key only', 'the private key', 'both', 'nothing'], why: 'The private key stays in KMS.' }]],
      'Types: symmetric (AES-256-GCM) and asymmetric (RSA/ECC), HMAC; customer managed, AWS managed, AWS owned; one key policy each; regional or multi-Region.',
      { k: 'split', t: '<b>KMS = Key Management Service</b>. Memory aid: picture <b>a bank vault with a teller window</b>: you hand documents through the window to be sealed or opened, but the vault key never comes out.', j: 'a key kept inside KMS that never leaves it unencrypted' }],
    ['aws10-cmk', 'Customer managed key', 'A KMS key [[you create and control]], [[including policy and rotation]].',
      'A customer managed key is {a KMS key you create and control}, {including its key policy and rotation}.', [
      [['a KMS key you create and control', 'a KMS key you own and manage'], [['a key AWS manages for a service', 'That is an AWS managed key (aws/s3).'], ['a key held in another cloud', 'No.'], ['a key on your server', 'It is in KMS.']], { q: 'Which can you delete (after a waiting period)?', o: ['a customer managed key', 'an AWS managed key', 'an AWS owned key', 'none'], why: 'You control its lifecycle; deletion waits 7–30 days.' }],
      [['including its key policy and rotation', 'you set its policy and rotation'], [['excluding its key policy', 'You write the key policy.'], ['with no rotation possible', 'Symmetric ones can rotate.'], ['with AWS choosing who uses it', 'You choose.']], { q: 'You must share a key with another account. Which kind?', o: ['customer managed', 'AWS managed', 'AWS owned', 'none'], why: 'Only you can edit a key policy you own.' }]],
      'Monthly fee per key plus requests; set rotation 90–2,560 days or on demand; scheduled deletion 7–30 days; can be multi-Region.',
      { k: 'contrast', t: 'Contrast pair: <b>customer managed = your own padlock</b> (you choose who has access, when to change it, when to throw it away). <b>AWS managed = the hotel safe</b> (works fine, but the hotel sets the rules).', j: 'a KMS key you create and control, including policy and rotation' }],
    ['aws10-env', 'Envelope encryption', 'Encrypting data [[with a data key]], then [[that key with a KMS key]].',
      'Envelope encryption is encrypting data {with a data key}, then encrypting {that data key with a KMS key}.', [
      [['with a data key', 'using a data key'], [['directly with the KMS key', 'KMS only encrypts up to 4 KB directly.'], ['with a password', 'Not a password.'], ['with a salt', 'Salts are for hashing.']], { q: 'S3 SSE-KMS encrypts the object with…', o: ['a data key from GenerateDataKey', 'the KMS key directly', 'the bucket name', 'the user\u2019s password'], why: 'Envelope encryption.' }],
      [['that data key with a KMS key', 'the data key under the KMS key'], [['the data key with another data key forever', 'The chain ends at the KMS key.'], ['the data key in plaintext next to the data', 'Only the encrypted data key is stored.'], ['nothing', 'The data key must be protected.']], { q: 'What is stored with the object?', o: ['the encrypted data key', 'the plaintext data key', 'the KMS key', 'nothing'], why: 'Useless without KMS.' }]],
      'GenerateDataKey returns plaintext + encrypted copies; plaintext is used then discarded; S3 Bucket Keys cut KMS calls.',
      { k: 'image', t: 'Memory aid: <b>a letter in an envelope inside a safe</b>. The letter (data) is locked with a small key; that small key is sealed in an envelope only the vault (KMS) can open.', j: 'encrypting data with a data key, then that key with a KMS key' }],
    ['aws10-rot', 'Key rotation', '[[New key material]] on a schedule; [[old material still decrypts]] old data.',
      'Key rotation creates {new key material for the same key}, while {old material still decrypts old data}.', [
      [['new key material for the same key', 'fresh material, same key ID'], [['a new key ID', 'The key ID and ARN stay the same.'], ['deleting the old key', 'Nothing is deleted.'], ['re-encrypting all data', 'Not needed.']], { q: 'After rotation, do apps need a new key ARN?', o: ['no', 'yes', 'only for S3', 'only cross-Region'], why: 'Same ID.' }],
      [['old material still decrypts old data', 'old ciphertext stays readable'], [['old data becomes unreadable', 'KMS keeps old material.'], ['old data is deleted', 'No.'], ['old data must be copied', 'No.']], { q: 'Default automatic rotation period for a customer managed key?', o: ['365 days (choose 90–2,560)', 'every hour', 'never possible', '10 years only'], why: 'Configurable.' }]],
      'Automatic rotation for symmetric customer managed keys (90–2,560 days); on-demand rotation (limited count); AWS managed keys yearly; not for asymmetric or imported material.',
      { k: 'image', t: 'Memory aid: <b>a new lock cylinder that still opens old drawers</b>. New things are locked with the new cylinder; KMS remembers the old ones for anything already locked.', j: 'new key material on a schedule while old material still decrypts old data' }]],
  qa: [{ id: 'aws10-q1', q: 'Two permissions to read an SSE-KMS object?', a: 's3:GetObject on the object and kms:Decrypt on the key (allowed by the key policy).' },
    { id: 'aws10-q2', q: 'Three kinds of KMS key by who manages them?', a: 'Customer managed, AWS managed, AWS owned.' }],
  problems: [{ id: 'aws10-p1', kind: 'open', title: 'Share encrypted exports with an auditor\u2019s account', scenario: 'Exports in your bucket use SSE-KMS with the AWS managed key aws/s3. An auditor\u2019s account must read them. The bucket policy already allows their role. They get AccessDenied. Why, and what do you change?', hint: 'Who controls the key policy?', solution: 'You cannot edit the key policy of an AWS managed key, so another account can never be allowed to use it. Re-encrypt with a customer managed key whose key policy allows the auditor\u2019s account (kms:Decrypt), and give their role kms:Decrypt in their account too.', explain: 'Cross-account needs Allow on both sides, and only a customer managed key policy can name another account.' }]
});

// ---------- Lesson 11 = Coursera 17 "Reading: Key salting" (retitled: it is about password hashes) ----------
Object.assign(ILL_FIGS, {
  rainbow: () => '<table class="mini aw-rtab"><tr><th>Precomputed (attacker\u2019s table)</th><th>SHA-256, no salt</th></tr><tr><td>password</td><td>5e88…</td></tr><tr><td>sunshine1</td><td>284f…</td></tr><tr><td>123456</td><td>8d96…</td></tr></table><div class="figcap">Without a salt, a stolen hash is looked up in a table like this. With a random salt per user, the attacker would need a separate table for every salt.</div>'
});
AWL({ id: 'aws11', title: 'Salting and hashing passwords', cz: 'Reading: Key salting',
  ill: { tables: {}, scenes: [
    { h: 'The attack: precomputed tables', fig: 'rainbow', say: 'Attackers precompute hashes of common passwords. If you store unsalted hashes, a leak is reversed by lookup.' },
    { h: 'The fix: a salt per user', fig: 'salt', say: 'A random salt is added to each password before hashing. Two users with the same password get different hashes. The salt is stored next to the hash; it is not secret.' }],
  qs: [
    { k: 'mc', ref: false, q: 'Ada and Bola both use "sunshine1". With per-user salts, do their stored hashes match?', o: ['No', 'Yes', 'Only if the salt is secret', 'Only with SHA-256'], w: [null, 'Different salts make different inputs, so different hashes.', 'The salt need not be secret for this.', 'Algorithm does not matter; the salt does.'], why: 'That is the point of salting.' },
    { k: 'mc', ref: false, q: 'Is the salt secret?', o: ['No: it is stored with the hash', 'Yes: keep it in KMS', 'Yes: never store it', 'Only for admins'], w: [null, 'Not needed; a separate secret "pepper" is a different, optional idea.', 'Without it you could never check a login.', 'Same for everyone.'], why: 'The login check needs it: hash(salt + typed password) = stored hash?' },
    { k: 'mc', ref: false, q: 'Which is best for storing a school portal\u2019s passwords?', o: ['Argon2id or bcrypt with a salt', 'SHA-256 without a salt', 'Encrypting passwords with a KMS key', 'Storing them in plain text in a private bucket'], w: [null, 'Fast and unsalted: easy to brute-force and look up.', 'Encryption is reversible; whoever has decrypt access sees every password.', 'Any leak exposes all of them.'], why: 'Slow, salted, one-way.' },
    { k: 'mc', ref: false, q: 'Does any KMS setting ask you for a salt?', o: ['No: salting is for password hashes, not encryption keys', 'Yes, every key', 'Only asymmetric keys', 'Only during rotation'], w: [null, 'KMS takes no salt: it generates and protects random keys.', 'Asymmetric keys are generated by KMS too; no salt is involved.', 'Rotation creates new key material; no salt is involved.'], why: 'Coursera\u2019s title "key salting" mixes the two.' }] },
  theory: { why: 'Data engineers store user tables and sometimes pseudonymise identifiers. Knowing hashing vs encryption prevents real leaks.',
    body: ['A <b>hash function</b> turns input into a fixed-length fingerprint; it is one-way. Passwords are stored as hashes, and a login is checked by hashing again. A <b>salt</b> is a random, non-secret value per user added before hashing, which defeats <b>rainbow tables</b> and hides equal passwords.',
      'Use slow password hashes (<b>Argon2id, scrypt, bcrypt, PBKDF2</b>), not fast SHA-256 alone. Add rate limiting and MFA. Services like Amazon Cognito do this for you.',
      'For pseudonymising phone numbers or emails in a dataset, a plain hash can be reversed by trying all values; use a keyed hash (HMAC) with a secret key, e.g. kept in Secrets Manager.',
      CZ('the title "Key salting".', 'salting applies to password hashes, not to encryption keys, and no AWS key setting takes a salt. The content of the reading itself is correct.')],
    pro: 'Passwords are Argon2id with per-user salts; for analytics, phone numbers are HMAC-SHA-256 with a key from Secrets Manager.', q: { q: 'Why is "encrypt the passwords" worse than hashing them?', a: 'Encryption is reversible: anyone with decrypt access (or a stolen key) gets every password. A hash cannot be reversed, only guessed.' } },
  T: [
    ['aws11-hash', 'Hash', 'A [[one-way]], [[fixed-length fingerprint]] of input data.',
      'A hash is {a one-way}, {fixed-length fingerprint} of input data.', [
      [['a one-way', 'an irreversible'], [['a two-way', 'That is encryption.'], ['a reversible', 'Hashes cannot be reversed, only guessed.'], ['a compressed', 'Compression is reversible.']], { q: 'You have the hash of a password. Can you compute the password from it?', o: ['no, only guess and compare', 'yes, with the salt', 'yes, with KMS', 'yes, by decoding'], why: 'One-way.' }],
      [['fixed-length fingerprint', 'same-size digest'], [['variable-length copy', 'Output length is fixed (SHA-256: 256 bits).'], ['encrypted copy', 'Not encryption.'], ['random number', 'Same input → same hash.']], { q: 'Same input twice gives…', o: ['the same hash', 'different hashes', 'an error', 'a longer hash'], why: 'Deterministic; that is why salts are needed.' }]],
      'Deterministic, fixed length, one-way, small input change → very different output; fast hashes (SHA-256) vs slow password hashes (Argon2id, bcrypt).',
      { k: 'image', t: 'Memory aid: <b>a fingerprint</b>. Easy to take from a person, impossible to rebuild the person from it.', j: 'a one-way fixed-length fingerprint of input data' }],
    ['aws11-salt', 'Salt', 'A [[random, non-secret value]] added to a password [[before hashing]].',
      'A salt is {a random, non-secret value} added to each password {before hashing}.', [
      [['a random, non-secret value', 'a random value, stored openly'], [['a secret key', 'That is a pepper or HMAC key.'], ['the same value for every user', 'Per user, random.'], ['the user\u2019s username', 'Predictable, so weak.']], { q: 'Where is a salt stored?', o: ['next to the hash', 'in KMS only', 'nowhere', 'in the user\u2019s browser'], why: 'Needed to check logins.' }],
      [['before hashing', 'to the password before it is hashed'], [['after hashing', 'It goes into the hash input.'], ['instead of hashing', 'It is used with hashing.'], ['before encrypting with KMS', 'Not encryption.']], { q: 'Two users, same password, salted. Hashes?', o: ['different', 'same', 'empty', 'reversible'], why: 'Different inputs.' }]],
      'Unique per password, long and random (16 bytes is common); stops rainbow tables and reveals nothing about equal passwords.',
      { k: 'image', t: 'Memory aid: <b>a pinch of salt in a stew</b>: two pots of the same stew taste different once each gets its own pinch. (Food picture; nothing to do with encryption keys.)', j: 'a random, non-secret value added to a password before hashing' }],
    ['aws11-rt', 'Rainbow table', '[[Precomputed hashes of common passwords]], used to [[reverse unsalted hashes]].',
      'A rainbow table is {precomputed hashes of common passwords}, used to {reverse unsalted hashes by lookup}.', [
      [['precomputed hashes of common passwords', 'a ready-made table of password hashes'], [['a table of salts', 'Salts are what defeat it.'], ['a list of IAM users', 'Not related.'], ['a colour chart', 'The name is historical.']], { q: 'What makes rainbow tables useless?', o: ['a unique salt per password', 'a longer username', 'HTTPS', 'a bigger bucket'], why: 'One table per salt is impractical.' }],
      [['reverse unsalted hashes by lookup', 'look up the password behind an unsalted hash'], [['encrypt passwords', 'It attacks hashes.'], ['store salts', 'No.'], ['speed up logins', 'No.']], { q: 'A leaked table of unsalted SHA-256 hashes is mostly at risk from…', o: ['lookup in precomputed tables', 'nothing', 'DNS spoofing', 'DDoS'], why: 'Common passwords fall at once.' }]],
      'A time–memory trade-off structure (chains of hash/reduce steps); defeated by salts; slow hashes defeat brute force too.',
      { k: 'image', t: 'Memory aid: <b>an answer key sold before the exam</b>. If every school uses the same exam (no salt), one answer key cracks all of them.', j: 'precomputed hashes of common passwords used to reverse unsalted hashes' }]],
  qa: [{ id: 'aws11-q1', q: 'Hashing vs encryption in one line.', a: 'Hashing is one-way (check by re-hashing); encryption is two-way (decrypt with the key).' },
    { id: 'aws11-q2', q: 'Name two slow password hashing algorithms.', a: 'Argon2id, bcrypt (also scrypt, PBKDF2).' }],
  problems: [{ id: 'aws11-p1', kind: 'open', title: 'Pseudonymise a bank\u2019s customer phones', scenario: 'Analysts need to join datasets by phone number without seeing the numbers. A teammate proposes SHA-256(phone). What is wrong and what do you do?', hint: 'How many phone numbers exist?', solution: 'There are few enough possible phone numbers that an attacker can hash them all and reverse SHA-256(phone). Use HMAC-SHA-256 with a secret key stored in Secrets Manager (same key for all rows so joins still work), and restrict who can read the key.', explain: 'A salt per row would break joins; a secret key keeps joins working but stops brute-force reversal.' }]
});

// ---------- Lesson 12 = Coursera 18 "Macie and Secrets Manager" ----------
const AWS_HARD = 'import psycopg2\nconn = psycopg2.connect(\n    host="db.internal", dbname="sales",\n    user="etl", password="Lagos2026!")\n';
const AWS_SM = 'import boto3, json, psycopg2\nsm = boto3.client("secretsmanager")\ns = json.loads(sm.get_secret_value(\n        SecretId="prod/sales/etl")["SecretString"])\nconn = psycopg2.connect(host=s["host"], dbname="sales",\n    user=s["username"], password=s["password"])\n';
Object.assign(ILL_FIGS, { awscode: sc => '<div class="aw-pol"><div class="aw-lab">' + sc.fp.cap + '</div><pre class="qy">' + _h(sc.fp.code) + '</pre></div>' });
AWL({ id: 'aws12', title: 'Amazon Macie and AWS Secrets Manager', cz: 'Macie and Secrets Manager',
  ill: { tables: {}, scenes: [
    { h: 'Two jobs, two services (and a cheaper sibling)', fig: 'awssec', say: 'Macie looks INTO S3 objects for sensitive data. Secrets Manager KEEPS secrets so code does not contain them. Parameter Store also stores values, without built-in rotation.' },
    { h: 'Hard-coded: the password is in the code', fig: 'awscode', fp: { code: AWS_HARD, cap: '⚠️ Anyone who can read the repo can read the password' }, say: 'If this file reaches Git, every clone, backup and log holds the password, and changing it means a code change.' },
    { h: 'Fetched at run time', fig: 'awscode', fp: { code: AWS_SM, cap: '✅ The code holds only the secret\u2019s name' }, say: 'IAM decides who may read prod/sales/etl; rotation changes the value without touching code.' }],
  qs: [
    { k: 'mc', ref: false, q: 'A hospital wants to find out which S3 objects contain patient names and card numbers.', o: ['Amazon Macie', 'Secrets Manager', 'AWS WAF', 'Route 53'], w: [null, 'Secrets Manager stores secrets; it does not scan data.', 'WAF filters web requests.', 'DNS.'], why: 'Macie discovers sensitive data in S3.' },
    { k: 'mc', ref: false, q: 'The ETL database password must change every 30 days without code changes.', o: ['Secrets Manager with automatic rotation', 'Macie', 'Parameter Store alone (built-in rotation)', 'a KMS key rotation'], w: [null, 'Macie finds data; it does not rotate.', 'Parameter Store has no built-in automatic rotation.', 'KMS rotation changes key material, not the DB password.'], why: 'Rotation schedules run a rotation function.' },
    { k: 'mc', ref: false, q: 'Which line is the hard-coded secret?', show: '<pre class="qy">' + _h(AWS_HARD) + '</pre>', o: ['password="Lagos2026!"', 'import psycopg2', 'dbname="sales"', 'host="db.internal"'], w: [null, 'An import is not a secret.', 'A database name is not a credential.', 'A host name is configuration, not a secret.'], why: 'Credentials do not belong in code.' },
    { k: 'mc', ref: false, q: 'Can Macie scan an RDS database?', o: ['No: Macie analyses S3', 'Yes', 'Only Aurora', 'Only with Secrets Manager'], w: [null, 'Its data discovery covers S3 objects only.', 'Aurora is a database engine in RDS; Macie does not scan it.', 'Secrets Manager stores secrets; it does not extend Macie to databases.'], why: 'Macie = S3.' }] },
  theory: { why: 'Data lakes collect personal data quietly, and pipelines need credentials. Macie finds the first; Secrets Manager keeps the second out of code.',
    body: ['<b>Amazon Macie</b> discovers sensitive data in <b>S3</b> (PII, financial data, credentials) using managed and custom data identifiers (pattern matching and machine learning), and evaluates bucket security (public access, encryption, sharing). Findings go to EventBridge and Security Hub.',
      '<b>AWS Secrets Manager</b> stores secrets encrypted with KMS, controls access with IAM, logs use in CloudTrail, and can <b>rotate</b> them automatically (managed rotation for some services, or a Lambda rotation function). <b>SSM Parameter Store</b> is cheaper for configuration and SecureString values but has no built-in automatic rotation.',
      CZ('Macie and Secrets Manager, side by side.', 'right. Add Parameter Store, because exam questions often ask you to choose between it and Secrets Manager: rotation needed → Secrets Manager.')],
    pro: 'Glue reads the warehouse password from Secrets Manager (rotated every 30 days); Macie scans the landing bucket weekly.', q: { q: 'Why does rotation reduce risk even if nobody saw a leak?', a: 'A leaked secret only works until the next rotation, so silent leaks expire.' } },
  T: [
    ['aws12-macie', 'Amazon Macie', '[[Finds and reports sensitive data]] [[stored in S3]].',
      'Amazon Macie {finds and reports sensitive data} {stored in Amazon S3}.', [
      [['finds and reports sensitive data', 'discovers sensitive data and reports it'], [['encrypts sensitive data', 'Encryption is S3/KMS.'], ['deletes sensitive data', 'It reports; you act.'], ['stores secrets', 'That is Secrets Manager.']], { q: 'Macie found card numbers in a public bucket. What does Macie do?', o: ['creates a finding', 'deletes the objects', 'encrypts them', 'blocks the bucket automatically'], why: 'Findings; automation is your choice (EventBridge).' }],
      [['stored in Amazon S3', 'in S3 buckets'], [['in RDS databases', 'Not RDS.'], ['in DynamoDB tables', 'Not DynamoDB.'], ['in emails', 'Not email.']], { q: 'Macie analyses…', o: ['S3 objects', 'network packets', 'IAM passwords', 'DNS records'], why: 'S3.' }]],
      'Managed + custom data identifiers, automated discovery and jobs, bucket security posture; findings to EventBridge/Security Hub.',
      { k: 'image', t: 'Memory aid: <b>Macie the detective</b> with a magnifying glass, walking the shelves of your S3 warehouse and pinning notes on boxes that contain names, card numbers and IDs. (A picture to remember the job; AWS has not published where the name comes from.)', j: 'finds and reports sensitive data stored in S3' }],
    ['aws12-sm', 'Secrets Manager', '[[Stores secrets]] and can [[rotate them automatically]].',
      'Secrets Manager {stores secrets such as database passwords} and can {rotate them automatically}.', [
      [['stores secrets such as database passwords', 'keeps credentials safely'], [['finds secrets in S3', 'That is Macie.'], ['creates encryption keys', 'That is KMS (Secrets Manager uses KMS).'], ['filters web traffic', 'WAF.']], { q: 'Where should a Glue job get its DB password?', o: ['Secrets Manager', 'the script', 'a public bucket', 'a DNS TXT record'], why: 'Fetched at run time.' }],
      [['rotate them automatically', 'change them on a schedule'], [['never change them', 'Rotation is the point.'], ['email them to admins', 'No.'], ['print them in logs', 'No.']], { q: 'What actually changes the password during rotation?', o: ['a rotation function (managed or Lambda)', 'Macie', 'the user', 'CloudFront'], why: 'Rotation function.' }]],
      'Encrypted with KMS; IAM + resource policies; CloudTrail; rotation schedules; cross-Region replication; per-secret monthly price plus API calls.',
      { k: 'contrast', t: 'Contrast pair: <b>Secrets Manager = a safe that changes its own combination</b> on schedule. <b>KMS = the locksmith</b> who makes and keeps the keys that lock the safe. <b>Parameter Store = a filing cabinet</b>: can lock a drawer, does not change it for you.', j: 'stores secrets and can rotate them automatically' }],
    ['aws12-hard', 'Hard-coded secret', 'A [[credential written into code]] or [[config files]].',
      'A hard-coded secret is {a credential written into code} or {into configuration files}.', [
      [['a credential written into code', 'a password in the source code'], [['a secret in Secrets Manager', 'That is the fix.'], ['a long password', 'Length is not the issue.'], ['an encrypted secret', 'The issue is where it lives.']], { q: 'Which is hard-coded?', o: ['password="Lagos2026!" in etl.py', 'SecretId="prod/sales/etl"', 'a KMS key ARN', 'an IAM role name'], why: 'The secret\u2019s value in code.' }],
      [['into configuration files', 'in config files in the repo'], [['into Secrets Manager', 'That is not hard-coding.'], ['into a role', 'Roles have no secrets.'], ['into DNS', 'No.']], { q: 'Why is a password in config.yaml in Git risky?', o: ['every clone and history keeps it', 'YAML is slow', 'Git encrypts it', 'nothing'], why: 'History never forgets.' }]],
      'Leaks via repos, images, logs; fix by fetching from Secrets Manager/Parameter Store, using roles instead of keys, and scanning repos.',
      { k: 'image', t: 'Memory aid: <b>a house key taped to the front door</b>: convenient, and anyone who walks past has it.', j: 'a credential written into code or config files' }]],
  qa: [{ id: 'aws12-q1', q: 'Secrets Manager vs Parameter Store?', a: 'Both store values encrypted with KMS. Secrets Manager adds automatic rotation and per-secret cost; Parameter Store is cheaper, no built-in rotation.' },
    { id: 'aws12-q2', q: 'What does Macie check besides object contents?', a: 'Bucket security: public access, encryption, sharing.' }],
  code: [{ id: 'aws12-c1', task: 'Fetch the secret instead of hard-coding it (Python, boto3)', lang: 'python', code: 'sm = boto3.client("[[secretsmanager]]")\ns = json.loads(sm.[[get_secret_value]](SecretId="prod/sales/etl")["SecretString"])' }],
  problems: [{ id: 'aws12-p1', kind: 'open', title: 'A leaked password in a shop\u2019s repo', scenario: 'An intern pushed the order database password to a public Git repo yesterday. Write the response.', hint: 'Order matters.', solution: '1) Rotate the password now (treat it as compromised). 2) Store it in Secrets Manager with rotation; change code to fetch it. 3) Remove it from the repo history and enable secret scanning. 4) Check database logs for unknown access.', explain: 'Deleting the commit is not enough: clones exist. Rotation makes the leaked value useless.' }]
});

// ---------- Lesson 13 = Coursera 19 "AWS WAF" ----------
Object.assign(ILL_FIGS, {
  wafacl: sc => { const f = sc.fp; return '<div class="aw-req small">Request: <b>' + f.req + '</b></div><table class="mini aw-rtab"><tr><th>Priority</th><th>Rule</th><th>Action</th><th></th></tr>' +
      f.rules.map((r, i) => '<tr class="' + (i === f.hit ? 'aw-hl' : i > f.hit && f.hit >= 0 ? 'aw-skip' : '') + '"><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td class="small">' + (f.hit < 0 || i < f.hit ? 'no match' : i === f.hit ? '◀ match: ' + r[2] : 'not checked') + '</td></tr>').join('') +
      '<tr' + (f.hit < 0 ? ' class="aw-hl"' : '') + '><td>—</td><td>Default action</td><td>' + (f.def || 'Allow') + '</td><td class="small">' + (f.hit < 0 ? '◀ nothing matched' : '') + '</td></tr></table>' +
      '<div class="figcap">Rules run in priority order (lowest first). A matching Allow or Block stops evaluation; a Count match is recorded and evaluation continues.</div>'; }
});
const WAF_RULES = [[0, 'Block IP set "known-bad"', 'Block'], [1, 'AWS managed: SQL database (SQLi)', 'Block'], [2, 'Rate-based: > 300 requests / 5 min per IP to /login', 'Block'], [3, 'Geo match: country not in the shop\u2019s markets', 'Count']];
AWL({ id: 'aws13', title: 'AWS WAF: filtering web requests', cz: 'AWS WAF',
  ill: { tables: {}, scenes: [
    { h: 'A web ACL in front of the app', fig: 'wafacl', fp: { req: 'GET /products?id=5 from 102.89.4.7', rules: WAF_RULES, hit: -1 }, say: 'A web ACL is attached to CloudFront, an Application Load Balancer, API Gateway or AppSync. Each request is checked against its rules in priority order.' },
    { h: 'SQL injection is blocked', fig: 'wafacl', fp: { req: "GET /products?id=5' OR '1'='1", rules: WAF_RULES, hit: 1 }, say: 'The managed SQL rule group recognises the injection pattern and blocks it. Later rules are not checked.' },
    { h: 'Too many login requests', fig: 'wafacl', fp: { req: 'POST /login, the 301st from one IP in 5 minutes', rules: WAF_RULES, hit: 2 }, say: 'A rate-based rule counts requests per IP over a window and blocks above the limit. It counts requests, not failed logins.' }],
  qs: [
    { k: 'mc', ref: false, q: 'You want to see what a new rule would block, without blocking anyone yet.', o: ['Set the rule action to Count', 'Set it to Block', 'Delete the default action', 'Use Shield'], w: [null, 'That blocks immediately.', 'Every web ACL has a default action.', 'Shield is DDoS protection.'], why: 'Count records matches in metrics and logs.' },
    { k: 'mc', ref: false, q: 'A bank\u2019s login API is hammered by one IP. Simplest WAF control?', o: ['a rate-based rule on the login path', 'a NACL on CloudFront', 'Macie', 'a KMS key'], w: [null, 'NACLs are subnet filters; CloudFront is not in your subnet.', 'Macie scans S3.', 'Encryption does not stop requests.'], why: 'Rate limit per IP.' },
    { k: 'mc', ref: false, q: 'Which can AWS WAF protect?', o: ['CloudFront, Application Load Balancer, API Gateway, AppSync', 'an EC2 instance directly', 'an S3 bucket directly', 'a Network Load Balancer'], w: [null, 'Put an ALB or CloudFront in front.', 'Put CloudFront in front.', 'WAF works at the HTTP layer; NLBs are layer 4.'], why: 'HTTP(S) entry points (also Cognito user pools, App Runner, Verified Access, Amplify).' },
    { k: 'mc', ref: false, q: 'A request matches no rule. What happens?', o: ['The web ACL\u2019s default action applies', 'It is always blocked', 'It is always allowed', 'It is counted only'], w: [null, 'Only if the default is Block.', 'Only if the default is Allow.', 'Count is a rule action, not the default.'], why: 'Default action: Allow or Block, your choice.' }] },
  theory: { why: 'APIs and dashboards that front your data get attacked at the HTTP layer. WAF is the filter there.',
    body: ['<b>AWS WAF</b> filters HTTP(S) requests with a <b>web ACL</b>: rules (IP sets, geo, headers, query strings, body, size, regex, rate) with actions <b>Allow, Block, Count</b> (plus CAPTCHA and Challenge), and a default action. <b>Managed rule groups</b> (AWS or Marketplace) cover SQL injection, XSS, known bad inputs, bots.',
      'Attach to CloudFront (global) or regional resources (ALB, API Gateway REST, AppSync, Cognito…). Logs go to CloudWatch Logs, S3 or Firehose; query them with Athena.',
      CZ('a rate rule can count failed login attempts per IP.', 'a rate-based rule counts <b>requests</b> (e.g. to /login), not failures. Counting failed logins needs the account takeover prevention managed rule group with response inspection, which works only on CloudFront.')],
    pro: 'Our API Gateway has a web ACL with the AWS SQLi and common rule groups, a 300-per-5-minutes rate rule, and logs to S3 for Athena.', q: { q: 'Why start new rules in Count mode?', a: 'To check real traffic for false positives before blocking customers.' } },
  T: [
    ['aws13-waf', 'AWS WAF', '[[Filters web requests by rules]] [[before they reach the app]].',
      'AWS WAF {filters HTTP(S) requests by rules} {before they reach your application}.', [
      [['filters HTTP(S) requests by rules', 'checks web requests against rules'], [['absorbs DDoS floods', 'That is Shield (WAF helps at layer 7).'], ['scans S3 for PII', 'That is Macie.'], ['routes DNS queries', 'Route 53.']], { q: 'Block SQL injection on an API.', o: ['AWS WAF', 'Shield Standard', 'Macie', 'KMS'], why: 'Layer-7 filtering.' }],
      [['before they reach your application', 'in front of the app'], [['after the app answers', 'It filters requests on the way in.'], ['inside the database', 'No.'], ['only on EC2 directly', 'Through CloudFront/ALB/API Gateway…']], { q: 'Where does WAF sit?', o: ['on CloudFront, ALB, API Gateway…', 'on a subnet', 'inside RDS', 'on IAM users'], why: 'HTTP entry points.' }]],
      'Web ACLs, rules, rule groups, managed rules, IP sets, regex sets, rate-based rules, Count/Allow/Block/CAPTCHA/Challenge; priced per web ACL, rule and million requests.',
      { k: 'split', t: '<b>WAF = Web Application Firewall</b>: a firewall for <b>web</b> (HTTP) <b>applications</b>. Memory aid: picture a <b>security guard reading every letter</b> that arrives (the request content), not just the envelope.', j: 'filters web requests by rules before they reach the app' }],
    ['aws13-acl', 'Web ACL', 'The [[set of WAF rules]] [[attached to a resource]].',
      'A web ACL is {the set of WAF rules and a default action} {attached to a protected resource}.', [
      [['the set of WAF rules and a default action', 'rules plus a default action'], [['a network ACL', 'NACLs filter packets at subnets.'], ['an IAM policy', 'IAM is for API permissions.'], ['a list of users', 'No.']], { q: 'A request matches no rule. What decides?', o: ['the web ACL default action', 'nothing', 'Shield', 'the NACL'], why: 'Default Allow or Block.' }],
      [['attached to a protected resource', 'associated with CloudFront/ALB/API'], [['attached to a subnet', 'NACL.'], ['attached to a user', 'IAM.'], ['attached to a KMS key', 'No.']], { q: 'One web ACL can be associated with…', o: ['several resources (of the same scope)', 'only one VPC', 'only S3', 'nothing'], why: 'CloudFront scope or a regional scope.' }]],
      'Scope: CloudFront (global, us-east-1) or regional; rules evaluated by priority; capacity measured in WCUs.',
      { k: 'contrast', t: 'Contrast pair: <b>web ACL reads the letter</b> (HTTP: paths, headers, body) at the app\u2019s front door. <b>Network ACL reads the envelope</b> (IP, port) at the subnet border.', j: 'the set of WAF rules and a default action attached to a resource' }],
    ['aws13-rate', 'Rate-based rule', '[[Blocks a client]] that sends [[too many requests in a time window]].',
      'A rate-based rule {blocks a client} that sends {too many requests in a time window}.', [
      [['blocks a client', 'limits a client'], [['blocks a country', 'That is geo match.'], ['blocks SQL injection', 'Managed SQLi rules do that.'], ['counts failed logins', 'It counts requests, not failures.']], { q: '300 requests per 5 minutes per IP, then block. Rule type?', o: ['rate-based', 'geo match', 'IP set', 'managed SQLi'], why: 'Rate.' }],
      [['too many requests in a time window', 'requests above a limit over a period'], [['too large a request', 'That is a size constraint.'], ['requests from new IPs', 'Not the idea.'], ['any request at night', 'Time of day is not the rule.']], { q: 'When the rate drops below the limit…', o: ['requests are allowed again', 'the IP is banned forever', 'Shield takes over', 'the rule is deleted'], why: 'Rolling window.' }]],
      'Aggregate by IP, forwarded IP, header, etc.; evaluation windows 1–10 minutes (default 5); scope-down statements limit it to e.g. /login.',
      { k: 'image', t: 'Memory aid: <b>a speed camera</b>: you may drive the road, just not faster than the limit. Slow down and you may pass again.', j: 'blocks a client that sends too many requests in a time window' }],
    ['aws13-count', 'Count mode', '[[Records rule matches]] [[without blocking]], for testing.',
      'Count mode {records rule matches} {without allowing or blocking}, so you can test a rule.', [
      [['records rule matches', 'logs what would match'], [['blocks matches', 'That is Block.'], ['deletes the rule', 'No.'], ['charges per block', 'No.']], { q: 'Before blocking a new geo rule, you…', o: ['run it in Count and read the logs', 'block first', 'delete the web ACL', 'turn on Shield Advanced'], why: 'Test safely.' }],
      [['without allowing or blocking', 'with no effect on the request'], [['while blocking', 'Count does not block.'], ['while allowing all later rules to stop', 'Evaluation continues.'], ['by banning the IP', 'No.']], { q: 'After a Count match, WAF…', o: ['continues to the next rule', 'stops and allows', 'stops and blocks', 'errors'], why: 'Count is non-terminating.' }]],
      'Non-terminating action; can add labels for later rules; can override a whole managed rule group to Count.',
      { k: 'image', t: 'Memory aid: <b>a referee watching a replay</b>: notes every foul, but the match goes on.', j: 'records rule matches without blocking, for testing a rule' }]],
  qa: [{ id: 'aws13-q1', q: 'Rule actions in WAF?', a: 'Allow, Block, Count, CAPTCHA, Challenge.' },
    { id: 'aws13-q2', q: 'Name two managed rule groups.', a: 'Core rule set (common), SQL database (SQLi), Known bad inputs, Bot Control, Account takeover prevention.' }],
  problems: [{ id: 'aws13-p1', kind: 'open', title: 'Protect a shop\u2019s checkout API', scenario: 'A shop\u2019s API Gateway REST API sees SQL injection probes and a bot hitting /checkout 2,000 times a minute. Design the web ACL.', hint: 'Order and testing.', solution: 'Web ACL on the API stage: priority 0 AWS SQLi managed group (Block), 1 core rule set, 2 rate-based rule scoped to /checkout per IP (Block), default Allow. Start new rules in Count, check logs, then switch to Block. Log to S3.', explain: 'Managed rules catch injection patterns; the rate rule handles the flood at the HTTP layer.' }]
});

// ---------- Lesson 14 = Coursera 20 "Reading: AWS Shield" ----------
Object.assign(ILL_FIGS, {
  ddos: () => AWX.hops([['🌊', 'Attack traffic from thousands of machines', 'volumetric (e.g. UDP reflection), state-exhaustion (SYN flood), or application layer (HTTP flood)'],
      ['📍', 'Route 53 + CloudFront edges', 'spread over many locations; Shield Standard absorbs common network/transport attacks automatically', 'aw-key'],
      ['🧰', 'AWS WAF web ACL', 'rate-based and managed rules stop HTTP floods (layer 7)'], ['⚖️', 'Application Load Balancer', 'only well-formed HTTP reaches the app'], ['🖥', 'App in private subnets, Auto Scaling', 'absorbs what is left; Shield Advanced cost protection covers scaling charges caused by a DDoS']]) +
    '<div class="figcap">Layered defence: Shield protects the network edge, WAF the application layer.</div>'
});
AWL({ id: 'aws14', title: 'AWS Shield: DDoS protection', cz: 'Reading: AWS Shield',
  ill: { tables: {}, scenes: [
    { h: 'A flood and the layers that stop it', fig: 'ddos', say: 'A DDoS attack tries to exhaust bandwidth, connection tables or the application. Each layer removes part of it.' },
    { h: 'Standard vs Advanced', fig: 'awssec', say: 'Shield Standard is on for everyone at no extra charge. Shield Advanced is a paid subscription for resources you choose.' }],
  qs: [
    { k: 'mc', ref: false, q: 'WAF or Shield? A SYN flood against your load balancer.', o: ['Shield', 'WAF', 'Macie', 'Secrets Manager'], w: [null, 'WAF reads HTTP requests; a SYN flood is below HTTP.', 'Macie scans S3.', 'Not a network service.'], why: 'Network/transport layer DDoS = Shield.' },
    { k: 'mc', ref: false, q: 'WAF or Shield? SQL injection in a query string.', o: ['WAF', 'Shield Standard', 'Shield Advanced alone', 'Route 53'], w: [null, 'Shield is about floods, not malicious content.', 'Advanced includes WAF at no extra fee, but WAF rules do the work.', 'DNS.'], why: 'Application-layer content = WAF.' },
    { k: 'mc', ref: false, q: 'A shop expects attacks during its Black Friday sale and wants 24/7 help from AWS experts during an attack.', o: ['Shield Advanced (Shield Response Team)', 'Shield Standard', 'a bigger instance', 'Macie'], w: [null, 'Standard has no response team.', 'Scaling alone is costly and may not be enough.', 'Not DDoS.'], why: 'SRT access comes with Shield Advanced (with a Business or Enterprise support plan).' },
    { k: 'mc', ref: false, q: 'Does Shield Standard cost extra?', o: ['No: it is automatic for all customers', 'Yes, $3,000 a month', 'Yes, per request', 'Only on CloudFront'], w: [null, 'That is Shield Advanced\u2019s subscription.', 'No per-request fee.', 'It applies to all AWS customers, strongest at the edge.'], why: 'Included.' }] },
  theory: { why: 'Public endpoints for dashboards, APIs and data sharing can be flooded. Knowing what is automatic and what is paid avoids surprises.',
    body: ['A <b>DDoS</b> attack floods a service from many machines. <b>Shield Standard</b>: automatic, no extra charge, against common network and transport layer attacks. <b>Shield Advanced</b>: a paid subscription (per organisation, with a one-year commitment) for EC2 Elastic IPs, load balancers, CloudFront, Global Accelerator and Route 53 hosted zones: enhanced detection, the <b>Shield Response Team</b>, <b>DDoS cost protection</b>, application-layer automatic mitigation with WAF, and standard WAF fees included for protected resources.',
      'Best practice: put CloudFront and Route 53 in front, add WAF rate-based rules, use load balancers and Auto Scaling.',
      CZ('the "DDoS Response Team (DRT)".', 'it is now called the <b>Shield Response Team (SRT)</b>. Also: with Shield Advanced, standard AWS WAF fees for the protected resources are included.')],
    pro: 'Standard covers us automatically; for the public API we would weigh Advanced against its $3,000-a-month subscription.', q: { q: 'Why can a DDoS raise your bill even if the site stays up?', a: 'Auto Scaling and data transfer grow with the attack traffic. Shield Advanced cost protection credits those charges.' } },
  T: [
    ['aws14-ddos', 'DDoS attack', '[[Many machines flooding a service]] so [[real users cannot reach it]].',
      'A DDoS attack is {many machines flooding a service} so that {real users cannot reach it}.', [
      [['many machines flooding a service', 'a flood of traffic from many sources'], [['one person guessing passwords', 'That is brute force.'], ['stealing data from S3', 'That is a breach, not DoS.'], ['SQL injection', 'Malicious content, not a flood.']], { q: 'D-DoS: the first D means…', o: ['distributed (many sources)', 'database', 'denied', 'DNS'], why: 'Distributed Denial of Service.' }],
      [['real users cannot reach it', 'legitimate users are shut out'], [['the data is encrypted', 'Ransomware, not DDoS.'], ['the bill drops', 'Usually the opposite.'], ['passwords leak', 'Not the goal of DDoS.']], { q: 'The aim of a DDoS is…', o: ['to make the service unavailable', 'to read secrets', 'to change DNS', 'to rotate keys'], why: 'Denial of service.' }]],
      'Types: volumetric, protocol/state-exhaustion (SYN flood), application layer (HTTP flood); defence in layers.',
      { k: 'split', t: '<b>DDoS = Distributed Denial of Service</b>. Memory aid: picture a <b>thousand danfo buses parked across one road</b>: no single bus is the problem; together nobody gets through.', j: 'many machines flooding a service so real users cannot reach it' }],
    ['aws14-std', 'Shield Standard', '[[Free, automatic DDoS protection]] at the [[network and transport layers]].',
      'Shield Standard is {free, automatic DDoS protection} against attacks at {the network and transport layers}.', [
      [['free, automatic DDoS protection', 'automatic DDoS protection at no extra charge'], [['paid DDoS protection', 'That is Advanced.'], ['a web firewall', 'That is WAF.'], ['manual DDoS protection you request', 'It is always on.']], { q: 'To get Shield Standard you…', o: ['do nothing', 'subscribe', 'call AWS', 'buy a key'], why: 'Automatic.' }],
      [['the network and transport layers', 'layers 3 and 4'], [['the application layer only', 'App-layer floods need WAF (or Advanced).'], ['the database layer', 'No.'], ['the IAM layer', 'No.']], { q: 'Shield Standard mainly stops…', o: ['SYN floods and UDP reflection', 'SQL injection', 'phishing', 'leaked keys'], why: 'Layer 3/4.' }]],
      'On for all AWS customers; strongest for traffic through CloudFront and Route 53.',
      { k: 'contrast', t: 'Contrast pair: <b>Shield Standard = the estate wall</b> every house gets for free. <b>Shield Advanced = hiring a security company</b> with a 24/7 response team and insurance for the damage bill.', j: 'free, automatic DDoS protection at the network and transport layers' }],
    ['aws14-adv', 'Shield Advanced', '[[Paid extra DDoS protection]] with a [[response team and cost protection]].',
      'Shield Advanced is {paid, extra DDoS protection} with {a response team and DDoS cost protection}.', [
      [['paid, extra DDoS protection', 'a paid DDoS subscription'], [['free for everyone', 'That is Standard.'], ['a CDN', 'CloudFront.'], ['a secrets store', 'Secrets Manager.']], { q: 'Shield Advanced subscription price?', o: ['about $3,000 a month per organisation, one-year commitment', 'free', '$1 a month', 'per request only'], why: 'Plus data transfer out fees for protected resources.' }],
      [['a response team and DDoS cost protection', 'SRT access and cost protection'], [['automatic key rotation', 'KMS.'], ['S3 data discovery', 'Macie.'], ['DNS failover', 'Route 53.']], { q: 'What is the SRT?', o: ['the Shield Response Team (formerly DRT)', 'a rate rule', 'a type of key', 'a hosted zone'], why: 'AWS DDoS experts.' }]],
      'Protects EIPs, ELB, CloudFront, Global Accelerator, Route 53; includes WAF fees for protected resources; SRT needs Business or Enterprise support.',
      { k: 'image', t: 'Memory aid: <b>a shield with a hotline on the back</b>: a stronger shield, a 24/7 number for experts, and a refund for the damage the flood caused to your bill.', j: 'paid extra DDoS protection with a response team and cost protection' }]],
  qa: [{ id: 'aws14-q1', q: 'Three things Shield Advanced adds.', a: 'Shield Response Team, DDoS cost protection, enhanced detection/visibility (also WAF fees included and automatic app-layer mitigation).' },
    { id: 'aws14-q2', q: 'Which resources can Shield Advanced protect?', a: 'EC2 Elastic IPs, load balancers, CloudFront, Global Accelerator, Route 53 hosted zones.' }],
  problems: [{ id: 'aws14-p1', kind: 'open', title: 'Defend a ticket site on sale day', scenario: 'A concert-ticket site runs on an ALB in one Region. Last sale an HTTP flood took it down. Design the defence in layers and say what is free.', hint: 'Edge, application, scaling.', solution: 'CloudFront in front (Shield Standard, free, at the edge) and Route 53; WAF web ACL with a rate-based rule and managed rules; ALB + Auto Scaling behind; consider Shield Advanced for SRT help and cost protection on sale days.', explain: 'Standard stops network floods; an HTTP flood is layer 7, so WAF does the work.' }]
});

// ---------- Console click-through practices (Coursera demos 03, 05, 12, 13, 15) ----------
// Drawn screens only, labelled "practice drawing, not a real AWS screenshot". Each unlocks after its idea lesson.
// Each step: a drawn screen, "what do you click or type next?", every wrong choice explained. The demos'
// slips are corrected (see PLAN.md). Progress lives in deLearn.aws (additive).
function CTS(svc, page, fields, extra) { return { svc, page, fields: fields || [], extra: extra || '' }; }
function ctScreenHTML(s) {
  return '<div class="ct-scr"><div class="ct-warn">✏️ Practice drawing, not a real AWS screenshot</div><div class="ct-top"><b>' + s.svc + '</b> › ' + s.page + '</div>' +
    (s.fields.length ? '<div class="ct-form">' + s.fields.map(f => '<div class="ct-f' + (f[2] ? ' ct-hl' : '') + '"><span>' + f[0] + '</span><code>' + (f[1] === '' ? '…' : _h(f[1])) + '</code></div>').join('') + '</div>' : '') + s.extra + '</div>';
}
AWS_CT.push({ id: 'awsP1', after: 'aws1', title: 'Create a custom VPC', cz: 'Demo: creating a custom VPC', steps: [
  { scr: CTS('VPC console', 'Your VPCs › Create VPC', [['Resources to create', 'VPC only', true], ['Name tag', 'de-vpc'], ['IPv4 CIDR block', '', true]]), q: 'Which IPv4 CIDR block do you enter for the VPC?', o: ['10.0.0.0/16', '10.0.0.1.0/24', '10.0.0.0/8', '10.0.0.0/30'], w: [null, 'Five numbers: not a valid IPv4 address (Coursera\u2019s slip).', 'Too large: a VPC IPv4 block can be at most /16.', 'Too small: the smallest VPC block is /28.'], why: '/16 gives 65,536 addresses to carve subnets from.' },
  { scr: CTS('VPC console', 'Subnets › Create subnet', [['VPC', 'de-vpc (10.0.0.0/16)'], ['Subnet name', 'public-a'], ['Availability Zone', '', true], ['IPv4 subnet CIDR', '10.0.1.0/24']]), q: 'The VPC is in us-west-1 (N. California). Which AZ can public-a use?', o: ['us-west-1a', 'us-east-1a', 'eu-west-1a', 'any AZ in the world'], w: [null, 'us-east-1a is in N. Virginia; a subnet must be in the VPC\u2019s Region (Coursera\u2019s slip).', 'Ireland: another Region.', 'Subnets are tied to the VPC\u2019s Region.'], why: 'AZ name = Region code + letter.' },
  { scr: CTS('VPC console', 'Subnets › Create subnet', [['Subnet name', 'private-b'], ['Availability Zone', 'us-west-1b'], ['IPv4 subnet CIDR', '', true]]), q: 'CIDR for private-b?', o: ['10.0.2.0/24', '10.0.1.0/24', '10.1.2.0/24', '10.0.0.0/16'], w: [null, 'Already used by public-a: subnets cannot overlap.', 'Outside the VPC\u2019s 10.0.0.0/16.', 'That is the whole VPC.'], why: 'Inside the VPC, not overlapping.' },
  { scr: CTS('VPC console', 'Internet gateways', [['de-igw', 'State: Detached', true]]), q: 'You created de-igw. Next?', o: ['Actions › Attach to VPC › de-vpc', 'Add it to a security group', 'Nothing, it works now', 'Attach it to public-a'], w: [null, 'SGs hold rules, not gateways.', 'A detached IGW carries no traffic.', 'IGWs attach to VPCs, not subnets.'], why: 'Attach to the VPC.' },
  { scr: CTS('VPC console', 'Route tables › public-rt › Edit routes', [['10.0.0.0/16', 'local'], ['Destination', '0.0.0.0/0'], ['Target', '', true]]), q: 'Choose the target for 0.0.0.0/0 in public-rt.', o: ['Internet Gateway › de-igw', 'NAT Gateway', 'local', 'Peering connection'], w: [null, 'NAT is for the private route table.', 'local covers only 10.0.0.0/16.', 'No peer here.'], why: 'This route makes the subnet public. Coursera says "source"; the field is the target.' },
  { scr: CTS('VPC console', 'NAT gateways › Create', [['Name', 'nat-a'], ['Subnet', '', true], ['Connectivity type', 'Public'], ['Elastic IP', 'Allocate']]), q: 'Which subnet does the NAT gateway go in?', o: ['public-a', 'private-b', 'any subnet', 'no subnet'], w: [null, 'A NAT in a private subnet has no route to the IGW.', 'It must be a public subnet.', 'It lives in a subnet.'], why: 'Public NAT lives in a public subnet.' },
  { scr: CTS('VPC console', 'Route tables › private-rt › Edit routes', [['10.0.0.0/16', 'local'], ['Destination', '0.0.0.0/0'], ['Target', '', true]]), q: 'Target for 0.0.0.0/0 in private-rt?', o: ['NAT Gateway › nat-a', 'Internet Gateway › de-igw', 'local', 'leave empty'], w: [null, 'Then the subnet would be public.', 'Local is VPC-only.', 'Then no internet path at all.'], why: 'Outbound-only for private-b.' },
  { scr: CTS('VPC console', 'Route tables › public-rt › Subnet associations', [['Explicit associations', 'none', true]]), q: 'The routes exist. What is still missing?', o: ['Associate public-rt with public-a (and private-rt with private-b)', 'Nothing', 'Delete the main route table', 'Add an IAM group'], w: [null, 'Unassociated subnets use the main route table, so the new routes never apply (the demo skips this).', 'You cannot delete the main table.', 'IAM does not route.'], why: 'Edit subnet associations.' }] });
AWS_CT.push({ id: 'awsP2', after: 'aws2', title: 'Peer two VPCs', cz: 'Demo: VPC peering', steps: [
  { scr: CTS('VPC console', 'Your VPCs', [['vpc-A', '10.0.0.0/16'], ['vpc-B', '', true]]), q: 'Choose a CIDR for vpc-B so the two can be peered.', o: ['192.168.0.0/16', '10.0.0.0/16', '10.0.5.0/24', '10.0.0.0/8'], w: [null, 'Same as vpc-A: overlapping.', 'Inside vpc-A\u2019s range: overlapping.', 'Contains vpc-A: overlapping.'], why: 'No overlap.' },
  { scr: CTS('VPC console', 'Peering connections › Create', [['Requester', 'vpc-A'], ['Accepter', 'vpc-B'], ['Status', 'Pending acceptance', true]]), q: 'Status is "Pending acceptance". Next?', o: ['Select it › Actions › Accept request (as vpc-B\u2019s owner)', 'Wait: it activates by itself', 'Create a second request from B', 'Attach an internet gateway'], w: [null, 'It expires if nobody accepts.', 'One connection is enough; it only needs accepting.', 'Peering does not use an IGW.'], why: 'The accepter must accept.' },
  { scr: CTS('VPC console', 'Route tables › rt-A › Edit routes', [['10.0.0.0/16', 'local'], ['Destination', '', true], ['Target', 'pcx-0ab…']]), q: 'Destination for the route in vpc-A\u2019s table?', o: ['192.168.0.0/16', '10.0.0.0/16', '0.0.0.0/0', 'pcx-0ab…'], w: [null, 'That is vpc-A itself (local).', 'That would send all traffic to the peer, which it will not forward.', 'That is the target, not the destination.'], why: 'The peer\u2019s CIDR.' },
  { scr: CTS('VPC console', 'Route tables › rt-B', [['192.168.0.0/16', 'local'], ['10.0.0.0/16', '(missing)', true]]), q: 'Ping from A to B fails. What is missing?', o: ['the return route in rt-B: 10.0.0.0/16 → pcx-0ab…', 'an internet gateway', 'a NAT gateway', 'nothing'], w: [null, 'Peering is private.', 'Not for VPC to VPC.', 'Replies need a route back.'], why: 'Routes on both sides.' },
  { scr: CTS('EC2 console', 'Security groups › sg-B › Inbound rules', [['Type', '', true], ['Source', '10.0.0.0/16']]), q: 'Allow the ping from vpc-A. Rule type?', o: ['All ICMP – IPv4', 'SSH', 'HTTPS', 'none needed'], w: [null, 'SSH is TCP 22; ping is ICMP.', 'HTTPS is TCP 443.', 'Default SGs do not allow inbound from other VPCs.'], why: 'Ping uses ICMP.' },
  { scr: CTS('Terminal', 'instance in vpc-A', [['$ ping', '', true]]), q: 'Which address do you ping?', o: ['instance B\u2019s private IP (192.168.x.x)', 'instance B\u2019s public IP', 'the peering ID', 'vpc-B\u2019s CIDR'], w: [null, 'That goes over the internet, not the peering (and the demo\u2019s subnets have no IGW anyway).', 'Not an address.', 'A range, not a host.'], why: 'Peering carries private IPs.' }] });
AWS_CT.push({ id: 'awsP3', after: 'aws8', title: 'Create users and a group', cz: 'Demo: IAM users and groups', steps: [
  { scr: CTS('IAM console', 'Users › Create user', [['User name', 'ada'], ['Provide console access', '', true]]), q: 'Ada will use the console. Choose:', o: ['Provide access: IAM user, custom password, must reset at next sign-in', 'No console access', 'Give her the root password', 'Share the user "admin"'], w: [null, 'Then she cannot sign in to the console.', 'Never share root.', 'One identity per person.'], why: 'Own credentials; reset at first sign-in.' },
  { scr: CTS('IAM console', 'Users › Create user › Permissions', [['Options', 'Add to group · Copy · Attach directly', true]]), q: 'Best way to give Ada permissions?', o: ['Add user to a group', 'Attach AdministratorAccess directly', 'Copy permissions from root', 'Skip and never set'], w: [null, 'Too broad and per-user policies are hard to manage.', 'Root has no copyable permissions.', 'She would be implicitly denied everything.'], why: 'Groups are job titles.' },
  { scr: CTS('IAM console', 'User groups › Create group', [['Group name', 'testers'], ['Attach policies', '', true]]), q: 'Testers only need to read objects in the test bucket. Attach…', o: ['a custom policy: s3:GetObject on arn:aws:s3:::qa-bucket/*', 'AmazonS3FullAccess', 'AdministratorAccess', 'nothing'], w: [null, 'Full S3 on every bucket is far beyond the task.', 'Everything.', 'Then they can do nothing.'], why: 'Least privilege.' },
  { scr: CTS('IAM console', 'Users › ada › Retrieve password', [['Console password', '••••••••', true]]), q: 'The password is shown once. What do you do?', o: ['Give it to Ada through a secure channel; she must change it', 'Email it in plain text to the team', 'Paste it in a shared doc', 'Ignore it'], w: [null, 'Email may be read by others.', 'Anyone with the doc can sign in.', 'Then she cannot sign in.'], why: 'Secure hand-over, forced reset.' }] });
AWS_CT.push({ id: 'awsP4', after: 'aws8', title: 'Write and attach a policy', cz: 'Demo: IAM policies', steps: [
  { scr: CTS('CLI', 'as user bola (no policies)', [['$ aws s3 mb s3://bola-reports', 'AccessDenied', true]]), q: 'Why did CreateBucket fail?', o: ['implicit deny: no policy allows it', 'explicit deny', 'the bucket name is invalid', 'S3 is down'], w: [null, 'No Deny statement exists.', 'The name is valid.', 'The error says AccessDenied.'], why: 'Deny by default.' },
  { scr: CTS('IAM console', 'Policies › Create policy › JSON (Coursera\u2019s version)', [], AWX.pol(AWS_ALL_POL, '⚠️ "Before": what the demo attaches')), q: 'The demo attaches this. What is wrong?', o: ['It allows every S3 action on every resource: not least privilege', 'Nothing', 'The Version is wrong', 'Effect must be Deny'], w: [null, 'It would let Bola delete any bucket in the account.', '2012-10-17 is the current policy language version.', 'Then nothing would work.'], why: 'It contradicts the lesson just before it.' },
  { scr: CTS('IAM console', 'Policies › Create policy › JSON', [['Action', '', true], ['Resource', 'arn:aws:s3:::bola-reports']]), q: 'Bola must only create her bucket. Action?', o: ['s3:CreateBucket', 's3:*', 's3:PutObject', 'iam:CreateUser'], w: [null, 'Every S3 action.', 'Uploading objects, not creating the bucket.', 'Wrong service.'], why: 'One action.' },
  { scr: CTS('IAM console', 'Policies › Create policy › JSON', [['Action', 's3:CreateBucket'], ['Resource', '', true]]), q: 'Resource?', o: ['arn:aws:s3:::bola-reports', '*', 'arn:aws:s3:::*', 'arn:aws:s3:::bola-reports/*'], w: [null, 'Any resource.', 'Any bucket name.', 'That is objects inside the bucket, not the bucket.'], why: 'The bucket ARN (no /*).' },
  { scr: CTS('IAM console', 'Users › bola › Add permissions', [['Policy', 'bola-create-reports', true]]), q: 'Attach it. Then retry the CLI. Result?', o: ['Bucket created; any other S3 action is still denied', 'All of S3 works', 'Still denied', 'Bola becomes admin'], w: [null, 'Only CreateBucket on that name is allowed.', 'The Allow matches now.', 'No.'], why: 'Exactly what is needed.' }] });
AWS_CT.push({ id: 'awsP5', after: 'aws9', title: 'Turn on MFA and create an access key', cz: 'Demo: enabling MFA', steps: [
  { scr: CTS('IAM console', 'Users › ada › Security credentials › Assign MFA device', [['Device name', 'ada-phone'], ['MFA device', '', true]]), q: 'Which device types can you choose?', o: ['Passkey or security key · Authenticator app · Hardware TOTP token', 'SMS text message', 'Email code', 'Security question'], w: [null, 'AWS no longer supports enabling SMS MFA.', 'Not an IAM MFA type.', 'Not a second factor of a different kind.'], why: 'Three current types.' },
  { scr: CTS('IAM console', 'Set up authenticator app', [['Show QR code', '▦'], ['MFA code 1', '', true], ['MFA code 2', '', true]]), q: 'After scanning the QR code, what do you type?', o: ['two consecutive codes from the app', 'the same code twice', 'Ada\u2019s password', 'the QR code text'], w: [null, 'They must be two successive codes.', 'Not the password.', 'Not needed.'], why: 'Proves the app and AWS clocks are in sync.' },
  { scr: CTS('IAM console', 'Users › ada › Create access key', [['Use case', '', true]]), q: 'Ada needs the CLI on her laptop. AWS shows a recommendation first. Which is it?', o: ['Consider IAM Identity Center / temporary credentials instead of long-term keys', 'Use the root user\u2019s keys', 'Share a key with the team', 'Store the key in the code'], w: [null, 'Never.', 'One identity per person.', 'Hard-coded secrets leak.'], why: 'Prefer temporary credentials when possible.' },
  { scr: CTS('IAM console', 'Retrieve access keys', [['Access key ID', 'AKIA…'], ['Secret access key', '••••••••', true]]), q: 'The secret is shown now. Later?', o: ['It can never be shown again; if lost, create a new key and deactivate the old', 'You can view it any time', 'Root can recover it', 'AWS Support emails it'], w: [null, 'Only at creation.', 'Coursera suggests root is needed for replacement; it is not: any identity with iam:CreateAccessKey can create one.', 'AWS cannot show it.'], why: 'Store it safely now (e.g. aws configure).' }] });

/* AWS-CONTENT-END */

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

/* ---------- the AWS track: follows the Coursera specialization "AWS Certified Data Engineer Associate Exam Prep"
   (LearnKartS) lesson by lesson, in Coursera's order and vocabulary. One DE Daily lesson per Coursera lesson
   (or per small group of short ones). Coursera is the baseline; DE Daily adds pictures, strict-but-simple wording,
   AWS-doc checks and practice. Text is our own words, never copied. Module/lesson names for courses not yet
   built are not invented: they show as "coming soon". ---------- */
const AWS_TRACK = { id: 'aws', title: 'AWS for Data Engineering', icon: '☁️',
  blurb: 'A separate track that follows the Coursera "AWS Certified Data Engineer Associate Exam Prep" specialization, lesson by lesson. It never mixes with your SQL daily session.',
  courses: [
    { n: 1, title: 'Course 1', state: 'not started', modules: [] },
    { n: 2, title: 'Course 2', state: 'done on Coursera', modules: [] },
    { n: 3, title: 'Course 3', state: 'done on Coursera', modules: [] },
    { n: 4, title: 'Course 4', state: 'in progress', modules: [
      { id: 'aws4m1', num: '4.1', title: 'Networking and IAM', icon: '☁️', status: 'ready', track: 'aws', lessons: AWS_C4M1 },
      { id: 'aws4m2', num: '4.2+', title: 'Later modules of Course 4', icon: '☁️', status: 'soon', track: 'aws', lessons: [] }] }] };
const AWS_MODS = AWS_TRACK.courses.flatMap(c => c.modules);
const AWS_READY = [];
// index one AWS module into LESSONS/ITEMS/PROBLEMS with track:'aws'. It is NOT added to READY or CURRICULUM,
// so the SQL daily plan, module % and Roadmap never see it.
function awsIndex(m) {
  if (m.status !== 'ready') return; if (!AWS_READY.includes(m)) AWS_READY.push(m);
  m.lessons.forEach((l, li) => {
    l.module = m.id; l.index = li; l.track = 'aws'; LESSONS[l.id] = l; l.itemIds = []; l.terms = l.terms || []; l.code = l.code || []; l.qa = l.qa || []; l.problems = l.problems || [];
    l.terms.forEach(t => { ITEMS[t.id] = { id: t.id, kind: 'term', lesson: l.id, module: m.id, track: 'aws', front: t.term, text: t.def }; l.itemIds.push(t.id); });
    l.code.forEach(c => { ITEMS[c.id] = { id: c.id, kind: 'code', lesson: l.id, module: m.id, track: 'aws', front: c.task, text: c.code, lang: c.lang, run: false, show: c.show, src: c.src, db: 'music' }; l.itemIds.push(c.id); });
    l.qa.forEach(q => { ITEMS[q.id] = { id: q.id, kind: 'qa', lesson: l.id, module: m.id, track: 'aws', front: q.q, text: q.a }; l.itemIds.push(q.id); });
    l.problems.forEach(p => { PROBLEMS[p.id] = Object.assign({ lesson: l.id, module: m.id, track: 'aws', db: 'music' }, p); });
  });
}
AWS_MODS.forEach(awsIndex);

/* ---------- state ---------- */
function defaultState() {
  return { v: 2, xp: 0, streak: 0, best: 0, lastActive: null, days: {}, items: {}, cards: {}, theory: {}, problems: {},
    settings: { minutes: 25, newPerDay: 8, focus: 'sql' }, created: today() };
}
let S, STORAGE_OK = true; var E = null; var T = null; // S = deLearn.v1, E = deLearn.ext (v3), T = deLearn.terms (v4)
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
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { STORAGE_OK = false; } if (E) saveExt(); if (T) saveTerms(); }

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

// Terms: never lower than before v4 (see termShown). Other items: fade level / 5.
function itemProgress(id) { if (ITEMS[id] && ITEMS[id].kind === 'term' && T) return S.items[id] && S.items[id].mastered ? 1 : termShown(id); const s = S.items[id]; if (!s) return 0; if (s.mastered) return 1; return isBite(id) ? Math.max(s.lvl / 5, biteFrac(id)) : s.lvl / 5; }
function lessonProgress(l) { return Math.max(lessonProgressRaw(l), (FLOOR10.l && FLOOR10.l[l.id]) || 0); }
// v10: application lessons (rung 2/3) have no terms or code: their % is the share of questions answered right once
function rungProgress(l) { const L = ILLUS[l.id]; if (!L || !L.qs.length) return 0; const ok = L.qs.filter((q, i) => { const r = vqRec(l.id, i); return r && r.ok; }).length;
  const ps = l.problems || []; const pp = ps.length ? ps.filter(p => S.problems[p.id] && S.problems[p.id].solved).length / ps.length : 0;
  return ps.length ? (ok / L.qs.length) * 0.85 + pp * 0.15 : ok / L.qs.length; }
function lessonProgressRaw(l) {
  if (l.rung) return rungProgress(l);
  const ids = l.itemIds; if (!ids || !ids.length) return 0;
  const ip = ids.reduce((a, id) => a + itemProgress(id), 0) / ids.length;
  const ps = l.problems || []; const pp = ps.length ? ps.filter(p => S.problems[p.id] && S.problems[p.id].solved).length / ps.length : 1;
  return ip * 0.85 + pp * 0.15 * (ip > 0 ? 1 : 0);
}
function moduleProgress(m) {
  if (m.status !== 'ready') return 0; const avg = ls => ls.length ? ls.reduce((a, l) => a + lessonProgress(l), 0) / ls.length : 0;
  // v7: lessons added by an update (l.added) can only raise the module %, never lower what learners already had
  // v8: generalised per release: the % a learner saw before each update (lessons that existed then) is a floor
  const cuts = [...new Set(m.lessons.filter(l => l.added).map(l => l.added))];
  return Math.max(avg(m.lessons), ...cuts.map(v => avg(m.lessons.filter(l => !l.added || l.added < v))), (FLOOR10.m && FLOOR10.m[m.id]) || 0);
}
/* v10: percentage floor. On the first v10 load the lesson and module % (as v9.1 computed them) are written once to a new
   key, deLearn.floor10, and no later % can fall below them. Existing keys are not touched. */
let FLOOR10 = {};
function initFloor10() {
  try { const raw = localStorage.getItem('deLearn.floor10'); if (raw) { FLOOR10 = JSON.parse(raw) || {}; return; } } catch (e) {}
  const f = { v: 10, at: today(), l: {}, m: {} };
  Object.values(LESSONS).forEach(l => { const p = lessonProgressRaw(l); if (p > 0) f.l[l.id] = p; });
  CURRICULUM.modules.forEach(m => { const p = moduleProgress(m); if (p > 0) f.m[m.id] = p; });
  FLOOR10 = f; try { localStorage.setItem('deLearn.floor10', JSON.stringify(f)); } catch (e) {}
}
// v10: a one-time backup of the raw saved progress before v10 writes anything (never overwritten)
function backupV9() { try { ['deLearn.v1', 'deLearn.ext', 'deLearn.terms', 'deLearn.aws'].forEach(k => { const v = localStorage.getItem(k); if (v != null && localStorage.getItem(k + '.v9bak') == null) localStorage.setItem(k + '.v9bak', v); }); } catch (e) {} }
// v10: application lessons open once the joins and many-to-many pictures (including their v10 steps) are seen
function rungReady(l) { if (!l.rung) return true; if (l.rung === 2) return ['sql5', 'sqlm'].every(id => visSeen(id) && !v10Pending(id, true)); return !!S.theory.sqlc; }
function rungReviews(n) { const t = today(), out = [];
  Object.keys(ILLUS).forEach(lid => { const L = ILLUS[lid]; if (!L.rung || !S.theory[lid]) return; L.qs.forEach((q, i) => { const r = q.rv && vqRec(lid, i); if (r && r.due && r.due <= t) out.push({ type: 'vq', lesson: lid, qi: i, rv: true, due: r.due }); }); });
  return out.sort((a, b) => a.due < b.due ? -1 : 1).slice(0, n); }

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
const COST = { card: 0.35, fade: 1, fadeHi: 1.5, newItem: 1.6, theory: 3, problem: 5, biteQ: 0.45, illus: 0.5 };
// v9: SCOPE picks the track the planner works on. 'core' = the SQL/ETL daily session (unchanged); 'aws' = the AWS track only.
let SCOPE = 'core';
const trk = id => (ITEMS[id] && ITEMS[id].track) || 'core';
const inScope = id => trk(id) === SCOPE;
const modOf = l => CURRICULUM.modules.find(x => x.id === l.module) || AWS_MODS.find(x => x.id === l.module);
function orderedReadyModules() { if (SCOPE === 'aws') return AWS_READY.slice(); const f = S.settings.focus; return READY.slice().sort((a, b) => (b.id === f) - (a.id === f)); }
const codeIds = l => l.itemIds.filter(x => ITEMS[x].kind !== 'term');
// v4: a lesson counts as started from its code/Q&A items only, so slow terms never hold lessons back
function lessonStarted(id) { const l = LESSONS[id]; return !!(l && ((S.theory[id] && codeIds(l).every(x => S.items[x])) || (E && E.placed[id]))); }
function moduleUnlocked(m) { return !m.requires || m.requires.every(lessonStarted); }
function lessonOpen(l) { return !E.placed[l.id] && (!S.theory[l.id] || codeIds(l).some(id => !S.items[id])); }
// v7: a lesson added by an update (l.added) before one the learner already started ("gap" lesson) is offered first, one a day in the normal
// new-lesson slot. It is never locked; fresh learners simply meet it in curriculum order.
function gapLesson() {
  for (const m of orderedReadyModules()) if (moduleUnlocked(m)) { const ls = m.lessons;
    for (let i = 0; i < ls.length; i++) if (ls[i].added && !S.theory[ls[i].id] && lessonOpen(ls[i]) && rungReady(ls[i]) && ls.slice(i + 1).some(x => S.theory[x.id] || E.placed[x.id])) return ls[i]; }
  return null;
}
function nextLesson() {
  const g = gapLesson(); if (g) return g;
  for (const m of orderedReadyModules()) if (moduleUnlocked(m)) for (const l of m.lessons) {
    if (E.placed[l.id] || !rungReady(l)) continue;
    if (!S.theory[l.id] || codeIds(l).some(id => !S.items[id])) return l;
  }
  return null;
}
function pickProblem(cur) {
  const all = Object.values(PROBLEMS).filter(p => (p.track || 'core') === SCOPE);
  const open = all.filter(p => (S.theory[p.lesson] || (cur && p.lesson === cur.id)) && !(S.problems[p.id] && S.problems[p.id].solved));
  const mods = orderedReadyModules().map(m => m.id);
  open.sort((a, b) => mods.indexOf(a.module) - mods.indexOf(b.module));
  if (open.length) return open[0];
  const seen = all.filter(p => S.problems[p.id]).sort((a, b) => (S.problems[a.id].last || '') < (S.problems[b.id].last || '') ? -1 : 1);
  return seen[0] || (cur ? PROBLEMS[cur.problems[0] && cur.problems[0].id] : null) || null;
}
/* ---------- v4 session builders ----------
   Daily order: [help once] → opening term block → code flashcards → code/Q&A fade reviews
   → theory → new code/Q&A items → problem → closing term review.
   Code and problems are planned first and never shrink for terms; terms then get
   about half as many items as everything else (= about 1/3 of the session). */
function buildDailySession() {
  const t = today(), budget = S.settings.minutes * 0.8; const other = []; let mins = 0;
  const notTerm = id => ITEMS[id] && ITEMS[id].kind !== 'term' && inScope(id);
  const cards = Object.keys(S.cards).filter(id => notTerm(id) && S.cards[id].due <= t).sort((a, b) => S.cards[a].due < S.cards[b].due ? -1 : 1);
  const maxCards = Math.max(10, Math.floor(budget * 0.35 / COST.card));
  const cardIds = cards.slice(0, maxCards); cardIds.forEach(id => other.push({ type: 'card', id })); mins += cardIds.length * COST.card;
  const fadeCap = Math.max(6, (budget - mins) * 0.6) + cardIds.length * COST.card;
  const fades = Object.keys(S.items).filter(id => notTerm(id) && !S.items[id].mastered && S.items[id].due <= t)
    .sort((a, b) => (S.items[a].due < S.items[b].due ? -1 : S.items[a].due > S.items[b].due ? 1 : S.items[a].lvl - S.items[b].lvl));
  let fadeN = 0;
  for (const id of fades) { const c = S.items[id].lvl >= 3 ? COST.fadeHi : COST.fade; if (fadeN && mins + c > fadeCap) break; other.push({ type: 'fade', id }); mins += c; fadeN++; }
  const inProgress = Object.keys(S.items).filter(id => notTerm(id) && !S.items[id].mastered).length;
  let lesson = null, newN = 0, theory = false, illus = [];
  if (inProgress <= 30 && budget - mins - COST.problem >= 3) {
    lesson = nextLesson();
    if (lesson) {
      let rem = budget - mins - COST.problem;
      // v6 rule: a lesson that changes the shape of data is SHOWN first (before/after tables), then
      // asked about with visual questions, and only then explained (theory) and drilled (terms).
      if (!S.theory[lesson.id]) { if (ILLUS[lesson.id] && !visSeen(lesson.id)) { illus = illusSteps(lesson.id); illus.forEach(x => other.push(x)); mins += illus.length * COST.illus; rem -= illus.length * COST.illus; }
        other.push({ type: 'theory', lesson: lesson.id }); mins += COST.theory; rem -= COST.theory; theory = true; }
      const newIds = lesson.itemIds.filter(id => !S.items[id] && notTerm(id));
      const k = Math.min(newIds.length, S.settings.newPerDay, 12, Math.max(3, Math.floor(rem / COST.newItem)));
      newIds.slice(0, k).forEach(id => { other.push({ type: 'fade', id, isNew: true }); mins += COST.newItem; newN++; });
    }
  }
  const prob = pickProblem(lesson);
  if (prob) { other.push({ type: 'problem', id: prob.id }); mins += COST.problem; }
  // catch-up for learners who read lessons before v6: at most one unseen illustration a day (not on a day a new one is shown)
  const cu = illus.length ? null : catchUpIllus(); const cuSteps = cu ? illusSteps(cu.id, null, cu.onlyNew) : [];
  // v10: up to two application questions due for review (combination drills and the real task)
  const rvSteps = rungReviews(2); cuSteps.push(...rvSteps);
  mins += cuSteps.length * COST.illus;
  // illustration/visual-question steps are not "other practice": they don't enlarge the term budget
  const tp = planTerms(other.length - illus.length, theory && lesson ? lesson.id : null);
  const steps = (T.helpSeen ? [] : [{ type: 'help' }]).concat(cuSteps, tp.open, other, tp.close);
  mins += (tp.open.length + tp.close.length) * 0.6;
  const names = [...new Set(tp.open.map(s => s.id))].map(id => ITEMS[id].front);
  return { steps, mins: Math.max(1, Math.round(mins)), terms: tp, pace: tp.pace, mode: 'daily',
    counts: { cards: cardIds.length, fades: fadeN, newN, theory, lesson, problem: prob, tOpen: tp.open.length, tClose: tp.close.length, ground: tp.open.filter(s => s.k === 'ground').length, names, other: other.length, waiting: tp.waiting, illus: illus.length, catchUp: cu ? cu.id : null, catchUpN: cuSteps.length } };
}
function lessonTermStep(id) {
  const ts = T.terms[id], t = today();
  if (!ts || ts.st === 'done' || ts.st === 'wait') return null;
  const bl = blocksLeft(id); if (bl.length) return { type: 'term', k: 'ground', id, g: bl[0] };
  if (ts.st === 'paused') return ts.ph.some(p => p.s >= 1) ? { type: 'term', k: 'maint', id } : null;
  const pi = activePhrase(ts);
  if (pi < 0) return ts.whole !== t && ts.lastUp !== t ? { type: 'term', k: 'whole', id } : null;
  if (ts.lastUp !== t && ts.ph[pi].miss !== t) return { type: 'term', k: 'adv', id };
  return { type: 'term', k: 'practice', id };
}
function buildLessonSession(lid) {
  // v6: illustrated lessons start with the pictures + visual questions, then theory, then practice
  const l = LESSONS[lid]; const pre = illusSteps(lid); const steps = [{ type: 'theory', lesson: lid }]; const termSteps = [];
  l.itemIds.forEach(id => {
    if (ITEMS[id].kind === 'term') { const s = lessonTermStep(id); if (s) termSteps.push(s); else if (S.cards[id]) termSteps.push({ type: 'card', id }); return; }
    if (S.items[id] && S.items[id].mastered) { if (S.cards[id]) steps.push({ type: 'card', id }); return; }
    steps.push({ type: 'fade', id, isNew: !S.items[id] });
  });
  const cap = Math.max(2, Math.round((steps.length - 1 + l.problems.length) / 2));
  const all = pre.concat(steps, termSteps.slice(0, cap)); l.problems.forEach(p => all.push({ type: 'problem', id: p.id }));
  return { steps: all, mins: Math.round(pre.length * COST.illus + COST.theory + l.itemIds.length * 1.3 + l.problems.length * COST.problem), mode: 'lesson', lesson: l };
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
  const v = { home: viewHome, session: viewSession, summary: viewSummary, roadmap: viewRoadmap, aws: viewAws, lesson: viewLesson, cards: viewCards, lab: viewLab, settings: viewSettings, placement: viewPlacement, learn: viewLearn }[UI.screen] || viewHome;
  app().innerHTML = v();
  const af = app().querySelector('[data-autofocus]'); if (af && UI.screen === 'session') { try { af.focus({ preventScroll: true }); } catch (e) {} }
}

/* ============================ HOME ============================ */
function viewHome() {
  const plan = buildDailySession(); UI.plan = plan;
  const lv = levelInfo(), st = currentStreak(), t = today(); const done = S.days[t] && S.days[t].session;
  const c = plan.counts; const li = [];
  if (c.catchUp) li.push('<li>🔍 Pictures first: <b>' + esc(LESSONS[c.catchUp].title) + '</b> (' + c.catchUpN + ' quick steps: see the tables, then tap/predict)</li>');
  if (c.tOpen) li.push('<li>🧩 <b>' + c.tOpen + '</b> term question' + (c.tOpen > 1 ? 's' : '') + ' first' + (c.ground ? ' (' + c.ground + ' building block' + (c.ground > 1 ? 's' : '') + ')' : '') + (c.names.length ? ': ' + c.names.map(esc).join(', ') : '') + '</li>');
  if (c.cards) li.push('<li>🃏 <b>' + c.cards + '</b> code flashcard' + (c.cards > 1 ? 's' : '') + '</li>');
  if (c.fades) li.push('<li>🔁 <b>' + c.fades + '</b> code / interview review' + (c.fades > 1 ? 's' : '') + '</li>');
  if (c.lesson) li.push('<li>📘 ' + (c.theory ? 'New lesson: ' : 'Continue: ') + '<b>' + esc(c.lesson.title) + '</b>' + (c.newN ? ' · ' + c.newN + ' new items' : '') + (c.illus ? ' · 🔍 starts with ' + c.illus + ' picture steps' : '') + '</li>');
  if (c.problem) li.push('<li>🧩 Problem: <b>' + esc(c.problem.title) + '</b></li>');
  if (c.tClose) li.push('<li>🔂 <b>' + c.tClose + '</b> quick term review' + (c.tClose > 1 ? 's' : '') + ' at the end</li>');
  if (c.tOpen + c.tClose) li.push('<li class="split">⚖️ Split: <b>' + (c.tOpen + c.tClose) + '</b> term · <b>' + (c.other - (c.illus || 0)) + '</b> code &amp; problem items (about 1/3 : 2/3)</li>');
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
    (isFreshUser() && !E.onboarded ? '<section class="card welcome"><h2>Welcome 👋</h2><p>Where should we start? The placement test checks what you can actually do (real SQL, outputs, pipeline scenarios) in about 10–15 minutes and skips what you already know.</p>' +
      '<div class="actions two"><button class="btn primary" data-act="goPlacement">🧭 Take placement test</button><button class="btn" data-act="startFresh">📘 Start from lesson 1</button></div></section>' : '') +
    '<section class="card today' + (isFreshUser() && !E.onboarded ? ' dim' : '') + '">' +
      '<div class="row"><h2>' + (done ? 'Bonus round' : "Today's session") + '</h2><span class="pill">⏱ ~' + plan.mins + ' min</span></div>' +
      (done ? '<p class="ok small">✅ You already finished today\'s session. Another round adds more XP.</p>' : '') +
      (plan.pace && plan.pace.note ? '<div class="pace small">' + esc(plan.pace.note) + '</div>' : '') +
      '<ul class="plan">' + li.join('') + '</ul>' +
      '<button class="btn primary big" data-act="startDaily" id="startBtn"' + (plan.steps.length ? '' : ' disabled') + '>▶ Start today\'s session</button>' +
      '<div class="muted small center">A short term block, then code and a problem, then a quick term review. <a href="#" data-act="go" data-to="learn">How learning works</a></div>' +
    '</section>' +
    '<section class="week">' + week + '</section>' +
    '<section class="card"><h3>Progress</h3>' + mods + '</section>' +
    (STORAGE_OK ? '' : '<p class="bad small">⚠️ Your browser is blocking local storage, so progress won\'t be saved. Use More → Export backup.</p>') +
    '<section class="card aw-entry" data-act="go" data-to="aws"><div class="row"><h3>' + AWS_TRACK.icon + ' ' + esc(AWS_TRACK.title) + '</h3><span class="pill">Open ›</span></div><div class="muted small">Separate track, following Coursera lesson by lesson. Not part of today\'s SQL session.</div></section>' +
    '</main>' + nav('home');
}

/* ============================ SESSION ============================ */
function startSession(plan) {
  SESSION = { steps: plan.steps.slice(), i: 0, mode: plan.mode, lid: plan.lesson ? plan.lesson.id : (plan.counts && plan.counts.lesson ? plan.counts.lesson.id : null), start: Date.now(), xp: 0, requeued: {}, second: {},
    stats: { right: 0, wrong: 0, ups: 0, mastered: 0, cards: 0, problems: 0, solved: 0, theory: 0 } };
  F = null; go('session');
}
function insertBeforeProblems(step) {
  let k = SESSION.steps.length;
  while (k > SESSION.i + 1 && SESSION.steps[k - 1].type === 'problem') k--;
  SESSION.steps.splice(Math.max(k, SESSION.i + 1), 0, step);
}
// A term step can become moot during the session (e.g. its tier finished earlier today): skip it.
function termStepValid(st) {
  if (st.type !== 'term') return true; if (st.k === 'ground') return !!GROUND[st.g];
  const ts = T.terms[st.id]; if (!ts) return false;
  if (st.k === 'adv' || st.k === 'practice') return ts.st === 'active' && activePhrase(ts) >= 0 && !blocksLeft(st.id).length;
  if (st.k === 'whole') return ts.st === 'active' && activePhrase(ts) < 0;
  if (st.k === 'review') return !!ts.ph[st.p] && ts.st === 'active';
  if (st.k === 'maint') return ts.ph.some(p => p.s >= 1);
  return true;
}
function nextStep() {
  SESSION.i++; F = null;
  while (SESSION.i < SESSION.steps.length && !termStepValid(SESSION.steps[SESSION.i])) SESSION.i++;
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
  else if (step.type === 'bite') body = viewBite(step);
  else if (step.type === 'card') body = viewCard(step);
  else if (step.type === 'problem') body = viewProblem(step);
  else if (step.type === 'term') body = viewTerm(step);
  else if (step.type === 'help') body = viewHelpStep();
  else if (step.type === 'illus') body = viewIllus(step);
  else if (step.type === 'vq') body = viewVQ(step);
  else if (step.type === 'nr') body = viewNR(step);
  else if (step.type === 'ct') body = viewCT(step);
  return head + '<main class="step">' + body + '</main>';
}

/* ---------- theory ---------- */
function theoryHTML(l) {
  const th = l.theory; const m = modOf(l);
  return '<div class="kicker">' + m.icon + ' ' + (m.track === 'aws' ? 'AWS ' + m.num : typeof m.num === 'number' ? 'Module ' + m.num : 'Master Project ' + m.num.slice(1)) + ' · Lesson ' + (l.index + 1) + ' · Theory</div><h2>' + esc(l.title) + '</h2>' +
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
  Object.values(ITEMS).forEach(o => { if (o.kind === it.kind && o.id !== it.id && (o.track || 'core') === (it.track || 'core') && (o.module === it.module || it.kind === 'code')) keySegments(o.text).filter(s => s.blank).forEach(s => { if (!kl.has(norm(s.s)) && (it.kind !== 'code' || o.lang === it.lang)) pool.add(s.s); }); });
  if (pool.size < n) Object.values(ITEMS).forEach(o => { if (o.kind === it.kind && o.id !== it.id && (o.track || 'core') === (it.track || 'core')) keySegments(o.text).filter(s => s.blank).forEach(s => { if (!kl.has(norm(s.s))) pool.add(s.s); }); });
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
function summaryLessonId(s) { return s.lid || null; }
function viewSummary() {
  const s = UI.last; if (!s) return viewHome();
  const st = s.stats; const tot = st.right + st.wrong; const acc = tot ? Math.round(st.right / tot * 100) : null;
  const mins = Math.max(1, Math.round((Date.now() - s.start) / 60000));
  const tomorrow = addDays(today(), 1);
  const dueT = Object.values(S.cards).filter(c => c.due <= tomorrow).length + Object.keys(S.items).filter(id => ITEMS[id] && ITEMS[id].kind !== 'term' && !S.items[id].mastered && S.items[id].due <= tomorrow).length + Object.values(T.terms).filter(ts => ts.st === 'active').length + Object.values(T.terms).reduce((a, ts) => a + ts.ph.filter(p => p.s === 3 && p.due && p.due <= tomorrow).length, 0);
  return '<main class="summary"><div class="big-emoji">🎉</div><h1>Session complete</h1>' +
    '<section class="stats"><div class="stat"><b>+' + s.xp + '</b><span>XP earned</span></div><div class="stat"><b>🔥 ' + currentStreak() + '</b><span>day streak</span></div><div class="stat"><b>' + mins + ' min</b><span>time</span></div></section>' +
    '<ul class="plan">' + (acc !== null ? '<li>🎯 Recall accuracy: <b>' + acc + '%</b> (' + st.right + '/' + tot + ')</li>' : '') +
    (st.ups ? '<li>⬆️ <b>' + st.ups + '</b> item' + (st.ups > 1 ? 's' : '') + ' moved up a level</li>' : '') +
    (st.mastered ? '<li>🏆 <b>' + st.mastered + '</b> mastered → added to flashcards</li>' : '') +
    (st.cards ? '<li>🃏 <b>' + st.cards + '</b> flashcards reviewed</li>' : '') +
    (st.problems ? '<li>🧩 Problems: <b>' + st.solved + '/' + st.problems + '</b> solved</li>' : '') +
    (T.fast && T.fast.on ? '<li>⚡ Fast lane on: consistent accuracy</li>' : T.fast && T.fast.off === today() ? '<li>⚡ Fast lane off: ' + esc(T.fast.why || 'accuracy dipped') + '. Back to the normal pace.</li>' : '') +
    '<li>📅 Tomorrow: about <b>' + dueT + '</b> reviews waiting</li></ul>' +
    (summaryLessonId(s) ? unlockBtnHTML(summaryLessonId(s)) : '') +
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
      h += '<ol class="lessons">' + m.lessons.map(l => { const lp = lessonProgress(l); return '<li data-act="go" data-to="lesson" data-l="' + l.id + '" class="' + (nl && nl.id === l.id ? 'next' : '') + '"><span>' + esc(l.title) + (nl && nl.id === l.id ? ' <b class="new">NEXT</b>' : '') + (E.placed[l.id] ? ' <small class="ok">✓ tested out</small>' : '') + (l.added && !S.theory[l.id] && !E.placed[l.id] && !(nl && nl.id === l.id) ? ' <b class="new">NEW</b>' : '') + '</span>' + lvBadge(lp) + bar(lp, 'thin') + '</li>'; }).join('') + '</ol>';
    } else h += '<ol class="lessons soon">' + m.lessons.map(l => '<li><span>' + esc(l.title) + '</span></li>').join('') + '</ol>';
    return h + '</section>';
  }).join('');
  const awsCard = '<section class="card mod aw-entry" data-act="go" data-to="aws"><div class="row"><h3>' + AWS_TRACK.icon + ' ' + esc(AWS_TRACK.title) + '</h3><span class="pill">Separate track ›</span></div><div class="muted small">' + esc(AWS_TRACK.blurb) + '</div></section>';
  return '<header class="top"><h1>Roadmap</h1><div class="muted small">Aimed at remote entry-level data engineering roles</div></header><main>' + mods + awsCard + '</main>' + nav('roadmap');
}
/* ---------- v9: the AWS track (its own screen, its own session; never inside the SQL daily session) ---------- */
function buildAwsSession(extras) { const prev = SCOPE; SCOPE = 'aws'; try { const p = buildDailySession(); p.mode = 'aws'; return extras ? awsExtras(p) : p; } finally { SCOPE = prev; } }
function awsNextLesson() { const prev = SCOPE; SCOPE = 'aws'; try { return nextLesson(); } finally { SCOPE = prev; } }
function viewAws() {
  const nl = awsNextLesson(); const plan = buildAwsSession(); const n = plan.steps.filter(x => x.type !== 'help').length;
  const cs = AWS_TRACK.courses.map(c => '<section class="card mod aw-course"><div class="row"><h3>' + esc(c.title) + '</h3><span class="pill grey">' + esc(c.state) + '</span></div>' +
    (c.modules.length ? c.modules.map(m => { const ready = m.status === 'ready' && m.lessons.length; const p = ready ? moduleProgress(m) : 0;
      return '<div class="aw-mod"><div class="row"><b>' + esc(m.num + ' · ' + m.title) + '</b>' + (ready ? '<small>' + Math.round(p * 100) + '%</small>' : '<span class="pill grey">' + (m.status === 'ready' ? 'Lessons being aligned to Coursera' : 'Coming soon') + '</span>') + '</div>' +
        (ready ? bar(p) + '<ol class="lessons">' + m.lessons.map(l => { const lp = lessonProgress(l); return '<li data-act="go" data-to="lesson" data-l="' + l.id + '" class="' + (nl && nl.id === l.id ? 'next' : '') + '"><span>' + esc(l.title) + (l.cz ? ' <small class="muted">(Coursera: ' + esc(l.cz) + ')</small>' : '') + (nl && nl.id === l.id ? ' <b class="new">NEXT</b>' : '') + (A.unl && A.unl[l.id] ? ' <small class="ok">⏩ unlocked early</small>' : '') + '</span>' + lvBadge(lp) + bar(lp, 'thin') + '</li>'; }).join('') + '</ol>' : '') + '</div>'; }).join('')
      : '<div class="muted small">Coming soon. Module names will follow Coursera when this course is built.</div>') + '</section>').join('');
  return '<header class="top"><button class="back" data-act="go" data-to="roadmap">‹ Roadmap</button><h1>' + AWS_TRACK.icon + ' ' + esc(AWS_TRACK.title) + '</h1><div class="muted small">' + esc(AWS_TRACK.blurb) + '</div></header><main>' +
    '<section class="card"><button class="btn primary big" data-act="startAws"' + (n ? '' : ' disabled') + '>▶ AWS session' + (n ? ' (~' + plan.mins + ' min)' : '') + '</button>' +
    '<div class="muted small center">' + (n ? 'Ideas first (pictures, then questions, then theory), then terms and practice. Your SQL daily session is not affected.' : 'Nothing due in the AWS track right now.') + '</div></section>' + cs +
    '<section class="card"><div class="row"><h3>🖱 Console click-through practice</h3><span class="pill grey">After the ideas</span></div><div class="muted small">Drawn practice screens of AWS console workflows (practice drawings, not real AWS screenshots). Each opens after you have read the theory of its lesson.</div><ol class="lessons">' +
      AWS_CT.map(c => { const open = !!S.theory[c.after], r = A.ct[c.id]; return '<li' + (open ? ' data-act="startCt" data-id="' + c.id + '"' : ' class="locked"') + '><span>' + esc(c.title) + ' <small class="muted">(Coursera: ' + esc(c.cz) + ')</small></span><small>' + (r ? '✓ ' + esc(r.done) : open ? c.steps.length + ' steps' : '🔒 after ' + esc(LESSONS[c.after].title)) + '</small></li>'; }).join('') + '</ol></section>' +
    '<section class="card soon"><div class="row"><h3>🏗 Final project</h3><span class="pill grey">Later</span></div></section>' +
    '</main>' + nav('roadmap');
}
function viewLesson() {
  const l = LESSONS[UI.params.l]; if (!l) return viewRoadmap();
  const lp = lessonProgress(l); const lvlTxt = id => { const s = S.items[id]; const ts = T.terms[id]; if (ts && T4[id]) { const n = ts.ph.length, k = ts.ph.filter(p => p.s >= 3).length, pi = activePhrase(ts);
    if (ts.st === 'done') return '<span class="lvlM">🏆 all tiers</span>'; if (ts.st === 'wait') return '<span class="lvlM">🏆 tier ' + ts.tier + ' · next ' + esc(ts.wait) + '</span>';
    if (blocksLeft(id).length && ts.st === 'active') return '<span class="lvlN">🧱 building blocks</span>';
    return '<span class="lvlN">' + (ts.st === 'paused' ? '⏸ ' : '🧩 ') + 'T' + (ts.tier + 1) + ' ' + k + '/' + n + (pi >= 0 && ts.st === 'active' ? ' · ' + FORMS[ts.ph[pi].s] : '') + '</span>'; }
    if (ITEMS[id].kind === 'term' && !s && !S.cards[id]) return '<span class="lvl0">queued</span>';
    if (s && !s.mastered && E.bites[id]) { const b = E.bites[id]; return '<span class="lvlN">🧩 ' + (b.c.l > 0 ? 'combining ' + Math.min(b.c.l, 3) + '/3' : b.p.filter(p => p.l === 3).length + '/' + b.p.length + ' pieces') + '</span>'; } return !s ? (S.cards[id] ? '<span class="lvlM">🃏 card</span>' : '<span class="lvl0">new</span>') : s.mastered ? '<span class="lvlM">🏆 mastered</span>' : '<span class="lvlN">L' + s.lvl + '</span>'; };
  const awsL = l.track === 'aws';
  return '<header class="top"><button class="back" data-act="go" data-to="' + (awsL ? 'aws' : 'roadmap') + '">‹ ' + (awsL ? 'AWS track' : 'Roadmap') + '</button><h1>' + esc(l.title) + '</h1></header><main>' +
    '<section class="card">' + lvBadge(lp) + bar(lp) +
    '<button class="btn primary big" data-act="startLesson" data-l="' + l.id + '">▶ Practise this lesson</button>' +
    '<div class="muted small center">Theory, every item at its current level, a few term steps, then the problems.</div></section>' +
    (awsL ? unlockBtnHTML(l.id) : '') +
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
    '<section class="card"><h3>🧭 Placement test</h3><p class="small muted">' + (E.placement ? 'Last result: level ' + E.placement.last + '/5 (' + esc(E.placement.date) + '). ' : '') + 'About 10–15 minutes of real SQL, output prediction and pipeline scenarios. It can only unlock lessons; it never resets or lowers your streak, XP, levels or cards.</p><button class="btn" data-act="goPlacement">Take the placement test</button></section>' +
    '<section class="card"><h3>Backup</h3><p class="small muted">Progress is saved on this device (localStorage). Export a backup regularly, or to move to another phone.</p>' +
    '<div class="actions two"><button class="btn" data-act="exportJSON">⬇ Export progress (.json)</button><label class="btn filebtn">⬆ Import backup<input type="file" accept=".json,application/json" id="importFile" hidden></label></div>' +
    '<details><summary class="small">Import by pasting text instead</summary><textarea id="importText" rows="4" class="mono" placeholder="Paste backup JSON here"></textarea><button class="btn small" data-act="importPaste">Import pasted backup</button></details></section>' +
    '<section class="card"><h3>AnkiDroid</h3><div class="actions two"><button class="btn" data-act="anki" data-all="0">Export my deck</button><button class="btn" data-act="anki" data-all="1">Export all items</button></div></section>' +
    '<section class="card"><h3>How learning works</h3><p class="small muted">Building blocks first, one phrase at a time, pick → type → spot on different days, exact small words, tiers, 2–3 terms at once, about 1/3 terms and 2/3 code per session.</p><button class="btn" data-act="go" data-to="learn">📖 How learning works</button>' +
      '<ul class="small plan"><li><b>Code &amp; interview answers:</b> fade-recall ladder L1 choose keywords → L2 type a few words → L3 type whole lines → L4 full recall, then an SM-2 flashcard.</li>' +
      '<li>Content: ' + READY.reduce((a, m) => a + m.lessons.length, 0) + ' lessons, ' + total + ' drill items, ' + probs + ' problems, ' + Object.keys(GROUND).length + ' building blocks.</li></ul></section>' +
    '<section class="card"><h3>Danger zone</h3><button class="btn bad" data-act="reset">Reset all progress</button></section>' +
    '<p class="muted small center">DE Daily · works offline · v10</p></main>' + nav('settings');
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
  const ext = o._ext; delete o._ext; const terms = o._terms; delete o._terms;
  const d = defaultState(); S = migrate(Object.assign(d, o, { settings: Object.assign(d.settings, o.settings || {}) }));
  E = Object.assign(defaultExt(), ext && typeof ext === 'object' ? ext : {}); ['bites', 'placed'].forEach(k => { if (!E[k] || typeof E[k] !== 'object') E[k] = {}; }); if (!E.pace || !Array.isArray(E.pace.log)) E.pace = { log: [], day: null };
  T = Object.assign(defaultTerms(), terms && typeof terms === 'object' ? terms : {}); ['ground', 'terms', 'vis'].forEach(k => { if (!T[k] || typeof T[k] !== 'object') T[k] = {}; }); if (!Array.isArray(T.log)) T.log = [];
  migrateExt(); migrateTerms(); save(); toast('Backup imported ✓'); go('home');
}

/* ============================ v3 EXTENSION STATE ============================
   Everything new (bite ladders, placement, pacing) lives under its own
   localStorage key, so the original progress object (deLearn.v1) is never
   rewritten by a migration. */
const EXT_KEY = 'deLearn.ext';
function defaultExt() { return { v: 1, bites: {}, placed: {}, placement: null, onboarded: null, pace: { log: [], day: null } }; }
function loadExt() {
  const d = defaultExt(); let raw = null;
  try { raw = localStorage.getItem(EXT_KEY); } catch (e) {}
  if (!raw) return d;
  try { const o = JSON.parse(raw); const r = Object.assign(d, o); ['bites', 'placed'].forEach(k => { if (!r[k] || typeof r[k] !== 'object') r[k] = {}; }); if (!r.pace || !Array.isArray(r.pace.log)) r.pace = { log: [], day: null }; return r; }
  catch (e) { return d; }
}
function saveExt() { try { localStorage.setItem(EXT_KEY, JSON.stringify(E)); } catch (e) {} }

/* ---------- pieces for long definitions ---------- */
const BITE_MIN_WORDS = 15;
function autoPieces(text, kk) {
  const words = text.trim().split(/\s+/); const n = words.length; const k = kk || (n >= 22 ? 4 : 3); const MIN = 3;
  const STRONG = new Set('so while where which when such without because instead usually e.g. otherwise stopping avoiding catching turning'.split(' '));
  const WEAK = new Set('and or that with for after before as to'.split(' '));
  const isList = b => words.slice(b, b + 3).some(w => /,$/.test(w)) || /^(and|or)$/i.test(words[b]) && /,$/.test(words[b - 2] || '');
  const cands = [];
  for (let b = MIN; b <= n - MIN; b++) {
    const w = words[b].toLowerCase(); let sc = 0;
    if (/[;:]$/.test(words[b - 1])) sc = 4; else if (/,$/.test(words[b - 1]) && !isList(b) && !/\(/.test(words.slice(Math.max(0, b - 4), b).join(' ').replace(/\([^)]*\)/g, ''))) sc = 3;
    else if (STRONG.has(w)) sc = 2; else if (WEAK.has(w) && !isList(b)) sc = 1;
    if (sc) cands.push({ b, s: sc });
  }
  const bounds = []; let last = 0;
  for (let i = 1; i < k; i++) {
    const ideal = Math.round(last + (n - last) / (k - i + 1)); let best = null;
    cands.forEach(c => { if (c.b - last < MIN || n - c.b < MIN * (k - i)) return; const d = Math.abs(c.b - ideal); if (d > 4) return; const sc = d - 1.5 * c.s; if (!best || sc < best.sc) best = { b: c.b, sc }; });
    const b = best ? best.b : Math.max(last + MIN, Math.min(ideal, n - MIN * (k - i))); bounds.push(b); last = b;
  }
  const out = []; let st = 0; bounds.concat([n]).forEach(b => { out.push(words.slice(st, b).join(' ').replace(/[,;:.]+$/, '')); st = b; });
  return out;
}
function buildBite(it) {
  const auth = TERM_BITES[it.id] || {}; const text = plain(it.text);
  const wc = text.trim().split(/\s+/).length;
  if (!auth.bites && wc < BITE_MIN_WORDS) return null;
  let pieces = auth.bites || autoPieces(text);
  const low = text.toLowerCase(); const segs = []; let cur = 0; const ok = [];
  pieces.forEach(p => { const i = low.indexOf(p.toLowerCase(), cur); if (i < 0) return; if (i > cur) segs.push({ s: text.slice(cur, i) }); segs.push({ s: text.slice(i, i + p.length), p: ok.length }); ok.push(text.slice(i, i + p.length)); cur = i + p.length; });
  if (cur < text.length) segs.push({ s: text.slice(cur) });
  if (ok.length < 2) return null;
  const keys = keySegments(it.text).filter(x => x.blank).map(x => x.s);
  return { pieces: ok, segs, keys: ok.map(p => keys.filter(k => p.toLowerCase().includes(k.toLowerCase()))), aspects: auth.aspects || [] };
}
Object.values(ITEMS).forEach(it => { if (it.kind === 'term') { const b = buildBite(it); if (b) it.bite = b; } });
const isBite = id => !!(ITEMS[id] && ITEMS[id].bite);

/* ---------- bite state ----------
   piece level p.l: 0 not introduced, 1 choose from options, 2 type it, 3 known
   combo level c.l: 0 still on pieces, 1 two pieces together, 2 three pieces, 3 full definition, 4 mastered
   A level goes up only after a correct answer on two different days (p.ok holds the first day). */
function newBite(id) { return { p: ITEMS[id].bite.pieces.map(() => ({ l: 0, ok: null })), c: { l: 0, ok: null }, due: today(), intro: today(), introDay: null, last: null, miss: null, lapses: 0, asp: {}, aspDay: null, aspN: 0, done: null }; }
/* Map an old fade-ladder item onto the new ladder without losing what was already learned. */
function biteFromOld(id, old) {
  const b = newBite(id); const n = b.p.length; const L = old.lvl || 1;
  if (L <= 1) b.p[0].l = 1;
  else if (L === 2) { b.p[0].l = 2; b.p[1].l = 1; }
  else if (L === 3) b.p.forEach(p => p.l = 2);
  else { b.p.forEach(p => p.l = 3); b.c.l = 1; }
  b.due = old.due && old.due < today() ? old.due : today(); b.intro = old.intro || today(); b.migrated = L; return b;
}
function migrateExt() {
  Object.keys(S.items).forEach(id => { const st = S.items[id]; if (isBite(id) && !st.mastered && !E.bites[id]) E.bites[id] = biteFromOld(id, st); });
}
function ensureBite(id) { if (!E.bites[id]) E.bites[id] = S.items[id] ? biteFromOld(id, S.items[id]) : newBite(id); return E.bites[id]; }
function biteFrac(id) { const b = E.bites[id]; if (!b) return 0; if (b.done) return 1; if (b.c.l > 0) return 0.6 + 0.4 * (b.c.l - 1) / 3; return 0.6 * b.p.reduce((a, p) => a + p.l, 0) / (3 * b.p.length); }
function activeBites() { return Object.keys(E.bites).filter(id => ITEMS[id] && !E.bites[id].done); }

/* ---------- pacing ---------- */
function paceLog(ok) { const l = E.pace.log; l.push({ d: today(), ok: ok ? 1 : 0 }); if (l.length > 40) l.splice(0, l.length - 40); }
function paceDay() { const t = today(); if (!E.pace.day || E.pace.day.d !== t) E.pace.day = { d: t, pieces: 0, terms: 0 }; return E.pace.day; }
function paceInfo() {
  const log = E.pace.log.slice(-20); const n = log.length; const miss = n ? log.filter(x => !x.ok).length / n : 0;
  if (n >= 8 && miss > 0.35) return { mode: 'slow', miss, pieces: 1, terms: 1, newFactor: 0.5, cap: 8, note: '🐢 Slowing down today to strengthen weak terms (' + Math.round(miss * 100) + '% missed recently).' };
  if (n >= 12 && miss < 0.12) return { mode: 'fast', miss, pieces: 6, terms: 4, newFactor: 1.25, cap: 15, note: '🚀 You\'re accurate lately, so a few extra new pieces today.' };
  return { mode: 'normal', miss, pieces: 4, terms: 3, newFactor: 1, cap: 12, note: '' };
}

/* ---------- planning questions for one term ---------- */
function planBite(id, allow) {
  const b = E.bites[id], it = ITEMS[id], t = today(); const qs = [];
  if (b.c.l > 0) qs.push({ k: 'combo' });
  else {
    b.p.forEach((p, i) => { if (p.l === 1 || p.l === 2) qs.push({ k: 'piece', p: i }); });
    const nxt = b.p.findIndex(p => p.l === 0); const ready = b.p.every(p => p.l === 0 || p.l >= 2);
    if (nxt >= 0 && ready && b.introDay !== t && (allow.pieces > 0 || !qs.length)) { qs.push({ k: 'piece', p: nxt, intro: true }); allow.pieces--; }
    const known = b.p.map((p, i) => p.l === 3 ? i : -1).filter(i => i >= 0);
    if (known.length) qs.push({ k: 'piece', p: known[Math.floor(Math.random() * known.length)], review: true });
  }
  const asp = it.bite.aspects;
  if (asp.length && (b.c.l > 0 || b.p.filter(p => p.l >= 2).length >= 2) && (!b.aspDay || b.aspDay <= addDays(t, -2))) qs.push({ k: 'aspect', a: (b.aspN || 0) % asp.length });
  return qs;
}
function weakQuestion(id) {
  const b = E.bites[id]; if (b.c.l > 0) return { k: 'combo' };
  let best = -1; b.p.forEach((p, i) => { if (p.l > 0 && (best < 0 || p.l < b.p[best].l)) best = i; });
  return best >= 0 ? { k: 'piece', p: best, review: true } : null;
}

/* ---------- answering ---------- */
function stepLevel(o, correct, max) {
  const t = today();
  if (correct) {
    if (o.l >= max) return 'keep';
    if (o.ok && o.ok !== t) { o.l++; o.ok = null; return 'up'; }
    if (!o.ok) o.ok = t; return 'half';
  }
  o.ok = null; const before = o.l; o.l = Math.max(1, o.l - 1); return o.l < before ? 'down' : 'stay';
}
function answerBite(id, q, correct) {
  const b = ensureBite(id), t = today(); let ev = null, lvl = 0;
  if (q.k === 'piece') { ev = stepLevel(b.p[q.p], correct, 3); lvl = b.p[q.p].l; if (b.c.l === 0 && b.p.every(p => p.l === 3)) { b.c.l = 1; b.c.ok = null; ev = 'combo'; } }
  else if (q.k === 'combo') {
    ev = stepLevel(b.c, correct, 4); lvl = b.c.l;
    if (b.c.l >= 4 && !b.done) { b.done = t; const st = itemState(id); st.mastered = true; addCard(id); ev = 'mastered'; }
  } else if (q.k === 'aspect') {
    const r = b.asp[q.a] || (b.asp[q.a] = { r: 0, w: 0 }); if (correct) { r.r++; b.aspN = (b.aspN || 0) + 1; } else r.w++; b.aspDay = t; ev = correct ? 'aspect' : 'stay';
  }
  if (!correct) { b.miss = t; b.lapses = (b.lapses || 0) + 1; }
  b.last = t; b.due = correct ? addDays(t, 1) : t;
  paceLog(correct); addXP(correct ? 3 + Math.max(1, lvl) : 1); save();
  return { event: ev, lvl, correct };
}
function checkPiece(input, piece, keys) {
  const r = checkBlank(input, [piece], true); if (r) return r;
  const have = tokens(input); if (!have.length) return false; const hs = new Set(have);
  const found = t => hs.has(t) || (t.length >= 5 && have.some(h => Math.abs(h.length - t.length) <= 1 && lev(h, t) <= 1));
  let want = tokens(piece).filter(t => t.length >= 3 && !STOP.has(t)); if (!want.length) want = tokens(piece);
  const kt = []; (keys || []).forEach(k => tokens(k).forEach(x => kt.push(x)));
  return want.filter(found).length / want.length >= 0.75 && kt.every(found) ? 'close' : false;
}
function pieceDistractors(id, p, n) {
  const it = ITEMS[id]; const target = it.bite.pieces[p]; const wc = target.split(/\s+/).length; const own = new Set(it.bite.pieces.map(x => norm(x)));
  const pool = []; Object.values(ITEMS).forEach(o => { if (o.bite && o.id !== id) o.bite.pieces.forEach(x => { if (!own.has(norm(x))) pool.push({ x, same: o.module === it.module, d: Math.abs(x.split(/\s+/).length - wc) }); }); });
  const seen = new Set(); const sorted = shuffle(pool).sort((a, b) => (b.same - a.same) || (a.d - b.d));
  const out = []; for (const c of sorted) { const k = norm(c.x); if (seen.has(k)) continue; seen.add(k); out.push(c.x); if (out.length >= n) break; }
  return out;
}

/* ---------- bite step view ---------- */
function initBite(step) {
  const id = step.id, it = ITEMS[id]; const q = step.q;
  const f = { bite: true, id, q, checked: false, vals: [], res: [] };
  if (q.k === 'intro') { f.mode = 'intro'; return f; }
  const b = ensureBite(id);
  if (q.k === 'piece' && b.p[q.p].l === 0) { b.p[q.p].l = 1; b.introDay = today(); const pd = paceDay(); pd.pieces++; save(); f.isNewPiece = true; }
  f.snap = JSON.stringify({ b, it: S.items[id] || null, c: S.cards[id] || null, xp: S.xp });
  if (q.k === 'piece') { const l = b.p[q.p].l; f.blanks = [q.p]; f.mode = l <= 1 ? 'mcq' : 'type'; f.lvlName = l <= 1 ? 'Choose the missing piece' : 'Type the missing piece'; }
  else if (q.k === 'combo') {
    const n = it.bite.pieces.length; const c = Math.min(b.c.l, 3);
    if (c >= 3) { f.mode = 'full'; f.lvlName = 'Whole definition from memory'; }
    else { const w = Math.min(n, c + 1); const s = Math.floor(Math.random() * (n - w + 1)); f.blanks = []; for (let i = s; i < s + w; i++) f.blanks.push(i); f.mode = 'type'; f.lvlName = 'Type ' + w + ' pieces together'; }
  } else if (q.k === 'aspect') {
    const a = it.bite.aspects[q.a]; f.asp = a; const r = b.asp[q.a] || { r: 0 };
    if (a.t && r.r >= 1) { f.mode = 'atype'; f.lvlName = 'Different angle · no options'; }
    else { f.mode = 'amcq'; f.lvlName = 'Different angle'; const opts = a.piece != null ? it.bite.pieces.slice() : a.o.slice(); f.answer = a.piece != null ? it.bite.pieces[a.piece] : a.o[0]; f.options = shuffle(opts); }
  }
  if (f.mode === 'mcq') { const tgt = it.bite.pieces[q.p]; f.answer = tgt; f.options = shuffle([tgt].concat(pieceDistractors(id, q.p, 3))); }
  return f;
}
function biteDefHTML(f, it, b) {
  return it.bite.segs.map(sg => {
    if (sg.p == null) return esc(sg.s);
    const k = f.blanks ? f.blanks.indexOf(sg.p) : -1;
    if (k < 0) return '<span class="pc' + (b && b.p[sg.p].l === 0 ? ' later' : '') + '">' + esc(sg.s) + '</span>';
    if (f.mode === 'mcq') { const cls = f.checked ? (f.res[0] ? 'ok' : 'bad') : f.pick != null ? 'filled' : ''; return '<span class="slot ' + cls + '">' + (f.checked ? esc(sg.s) : f.pick != null ? esc(f.options[f.pick]) : '\u00a0'.repeat(10)) + '</span>'; }
    return '<span class="gap ' + (f.checked ? (f.res[k] ? 'ok' : 'bad') : '') + '">' + (f.checked ? esc(sg.s) : '(' + (k + 1) + ') ' + sg.s.split(/\s+/).length + ' words') + '</span>';
  }).join('');
}
function bitePips(b) {
  if (!b) return '';
  return '<div class="pips">' + b.p.map((p, i) => '<i class="l' + p.l + '" title="piece ' + (i + 1) + '"></i>').join('') + '<span>' + (b.c.l > 0 ? 'All pieces known · combining: step ' + Math.min(b.c.l, 3) + '/3' : b.p.filter(p => p.l === 3).length + '/' + b.p.length + ' pieces known') + '</span></div>';
}
function viewBite(step) {
  if (!F || F.stepIndex !== SESSION.i) { F = initBite(step); F.stepIndex = SESSION.i; }
  const f = F, it = ITEMS[step.id], L = LESSONS[it.lesson]; const b = E.bites[step.id];
  let h = '<div class="kicker">🧩 Bite-size term · ' + esc(L.title) + (f.isNewPiece || f.mode === 'intro' ? ' · <b class="new">NEW</b>' : '') + (step.extra ? ' · <b class="new">EXTRA REVIEW</b>' : '') + '</div>';
  if (f.mode === 'intro') {
    const n = it.bite.pieces.length;
    return h + '<h2>' + esc(it.front) + '</h2><p class="def">' + it.bite.segs.map(sg => sg.p == null ? esc(sg.s) : '<span class="pc num" data-n="' + (sg.p + 1) + '">' + esc(sg.s) + '</span>').join('') + '</p>' +
      '<p class="muted small">Read it once, slowly. This definition has <b>' + n + ' pieces</b>. You\'ll learn <b>one piece at a time</b>, first with options, then typing it. A step levels up only after you get it right on <b>two different days</b>. Then pieces are combined, until you can say the whole thing.</p>' +
      '<div class="actions"><button class="btn primary big" data-act="biteIntro" data-autofocus>Start with piece 1</button></div>';
  }
  h += bitePips(b) + '<div class="muted small">' + esc(f.lvlName) + '</div>';
  if (f.mode === 'amcq' || f.mode === 'atype') {
    h += '<h2>' + esc(it.front) + '</h2><p class="def model">' + esc(f.asp.q) + '</p>';
    if (f.mode === 'amcq') h += '<div class="opts">' + f.options.map((o, i) => '<button class="opt' + (f.checked ? (o === f.answer ? ' ok' : i === f.pick ? ' bad' : '') : '') + '" data-act="bitePick" data-i="' + i + '"' + (f.checked ? ' disabled' : '') + '>' + esc(o) + '</button>').join('') + '</div>';
    else h += '<div class="inputs"><label class="inp ' + (f.checked ? (f.res[0] ? 'ok' : 'bad') : '') + '"><span>?</span><input type="text" data-i="0" value="' + esc(f.vals[0] || '') + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (f.checked ? ' disabled' : '') + ' data-autofocus placeholder="type your answer"></label></div>';
  } else if (f.mode === 'full') {
    h += '<h2>Define from memory: ' + esc(it.front) + '</h2><p class="muted">Write the whole definition. Same meaning counts.</p>' +
      '<textarea class="recall" rows="4" data-i="0" autocomplete="off" autocapitalize="off" spellcheck="false"' + (f.checked ? ' disabled' : '') + ' data-autofocus>' + esc(f.vals[0] || '') + '</textarea>';
  } else {
    h += '<h2>' + esc(it.front) + '</h2><p class="def">' + biteDefHTML(f, it, b) + '</p>';
    if (f.mode === 'mcq') h += '<div class="opts">' + f.options.map((o, i) => '<button class="opt' + (f.checked ? (o === f.answer ? ' ok' : i === f.pick ? ' bad' : '') : '') + '" data-act="bitePick" data-i="' + i + '"' + (f.checked ? ' disabled' : '') + '>' + esc(o) + '</button>').join('') + '</div>';
    else h += '<div class="inputs">' + f.blanks.map((p, i) => '<label class="inp ' + (f.checked ? (f.res[i] ? 'ok' : 'bad') : '') + '"><span>' + (i + 1) + '</span><input type="text" data-i="' + i + '" value="' + esc(f.vals[i] || '') + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' + (f.checked ? ' disabled' : '') + (i === 0 ? ' data-autofocus' : '') + ' placeholder="' + it.bite.pieces[p].split(/\s+/).length + ' words"></label>').join('') + '</div>';
  }
  if (!f.checked) {
    if (f.mode === 'mcq' || f.mode === 'amcq') h += '<div class="actions"><button class="btn ghost" data-act="biteDontKnow">I don\'t know: show me</button></div>';
    else h += '<div class="actions"><button class="btn primary big" data-act="checkBite">' + (f.mode === 'full' ? 'Check my answer' : 'Check') + '</button><button class="btn ghost" data-act="biteDontKnow">I don\'t know: show me</button></div>';
  } else if (f.mode === 'full' && !f.graded) {
    const pct = Math.round(f.score.score * 100);
    h += '<div class="feedback ' + (pct >= 75 ? 'good' : 'meh') + '"><b>Keyword match: ' + pct + '%</b>' + (f.score.missingKeys.length ? '<br>Missing key terms: ' + f.score.missingKeys.map(k => '<code>' + esc(k) + '</code>').join(' ') : '') + '</div>' +
      '<div class="label">Model answer</div><p class="def model">' + esc(plain(it.text)) + '</p><div class="muted small">Same meaning counts. You decide:</div>' +
      '<div class="actions two"><button class="btn bad" data-act="biteSelf" data-ok="0">✗ I was wrong</button><button class="btn good' + (pct >= 75 ? ' primary' : '') + '" data-act="biteSelf" data-ok="1">✓ I was right</button></div>';
  } else {
    const o = f.outcome; let msg;
    if (o.correct) msg = o.event === 'mastered' ? '🏆 Mastered! It joins your flashcard deck.' : o.event === 'combo' ? '🎉 Every piece is known. Next: combining pieces.' : o.event === 'up' ? '⬆️ Level up! Second good day in a row for this step.' : o.event === 'half' ? '✅ Correct! Get it right again on another day to level up.' : '✅ Correct!';
    else msg = o.event === 'down' ? '↩️ Not quite. This step drops back one level. You\'ll see it again soon.' : '↩️ Not quite. You\'ll see it again soon.';
    h += '<div class="feedback ' + (o.correct ? 'good' : 'badfb') + '">' + msg + (f.close ? ' <span class="muted">(close enough)</span>' : '') + '</div>';
    if (f.asp && f.asp.why) h += '<div class="hintbox">💡 ' + esc(f.asp.why) + (f.mode === 'atype' && !o.correct ? '<br>Answer: <b>' + esc(f.asp.o ? f.asp.o[0] : f.asp.t[0]) + '</b>' : '') + '</div>';
    if (!o.correct && !f.asp) h += '<div class="label">Full definition</div><p class="def model">' + esc(plain(it.text)) + '</p>';
    h += '<div class="actions"><button class="btn primary big" data-act="next" data-autofocus>Continue</button>' + (!o.correct && (f.mode === 'type' || f.mode === 'atype') && !f.overridden ? '<button class="btn ghost" data-act="biteOverride">I was actually right (typo or synonym)</button>' : '') + '</div>';
  }
  return h;
}
function finishBite(correct) {
  const step = SESSION.steps[SESSION.i]; const o = answerBite(step.id, step.q, correct);
  F.checked = true; F.outcome = o;
  if (correct) { SESSION.stats.right++; if (o.event === 'mastered') SESSION.stats.mastered++; else if (o.event === 'up' || o.event === 'combo') SESSION.stats.ups++; }
  else SESSION.stats.wrong++;
  const key = 'b' + step.id + JSON.stringify(step.q);
  if (!correct && !SESSION.requeued[key]) { SESSION.requeued[key] = true; insertBeforeProblems({ type: 'bite', id: step.id, q: Object.assign({}, step.q, { intro: false }), retry: true }); F.requeuedNow = key; }
}

/* ---------- placement test ---------- */
function isFreshUser() { return !S.lastActive && !S.xp && !Object.keys(S.items).length && !Object.keys(S.cards).length && !Object.keys(S.theory).length; }
function placedLevelOf(lid) { const lv = PLACE_LEVELS.find(x => x.lessons.includes(lid)); return lv ? lv.n : 99; }
function ptNew() { return { phase: 'intro', lv: 1, stats: {}, used: {}, cur: null, log: [] }; }
function ptNext() {
  const P = UI.pt; const st = P.stats[P.lv] || (P.stats[P.lv] = { r: 0, w: 0, n: 0 });
  const pool = PLACE_BANK.filter(q => q.lv === P.lv && !P.used[q.id]);
  const hands = shuffle(pool.filter(q => q.kind !== 'mcq')), mcq = shuffle(pool.filter(q => q.kind === 'mcq'));
  const q = st.n === 0 ? (hands[0] || mcq[0]) : st.n === 1 ? (mcq[0] || hands[0]) : (hands[0] || mcq[0]);
  if (!q) return ptFinish();
  P.used[q.id] = true; st.n++;
  P.cur = { q, val: '', out: '', checked: false, ok: null, pick: null, opts: q.kind === 'mcq' ? shuffle(q.o) : null };
  P.phase = 'q';
}
function ptAnswer(ok) {
  const P = UI.pt; const c = P.cur; c.checked = true; c.ok = ok; const st = P.stats[P.lv];
  if (ok) st.r++; else st.w++; P.log.push({ id: c.q.id, lv: P.lv, ok });
  if (ok) addXP(2);
}
function ptContinue() {
  const P = UI.pt; const st = P.stats[P.lv];
  if (st.r >= 2) { st.pass = true; st.shaky = st.w > 0; if (P.lv >= 5) return ptFinish(); P.lv++; return ptNext(); }
  if (st.w >= 2) return ptFinish();
  ptNext();
}
function ptFinish() {
  const P = UI.pt; let top = 0; for (let l = 1; l <= 5; l++) { if (P.stats[l] && P.stats[l].pass) top = l; else break; }
  let level = top; if (top > 0 && P.stats[top].shaky) level = top - 1; // unsure -> place lower
  P.result = { top, level, unlocked: applyPlacement(level) }; P.phase = 'result';
}
function applyPlacement(level) {
  const t = today(); let unlocked = 0, cards = 0, k = 0;
  const lessons = []; PLACE_LEVELS.filter(x => x.n >= 1 && x.n <= level).forEach(x => x.lessons.forEach(l => lessons.push(l)));
  lessons.forEach(lid => {
    const l = LESSONS[lid]; if (!l) return;
    if (!E.placed[lid] && !lessonStarted(lid)) { E.placed[lid] = t; unlocked++; }
    l.itemIds.forEach(id => { if (!S.items[id] && !S.cards[id]) { S.cards[id] = { ease: 2.5, ivl: 0, reps: 0, lapses: 0, due: addDays(t, 2 + (k++ % 20)), added: t, placed: true }; cards++; } });
  });
  const prev = E.placement || {}; E.placement = { best: Math.max(prev.best || 0, level), last: level, date: t, n: (prev.n || 0) + 1 };
  E.onboarded = E.onboarded || t; save();
  return { lessons: unlocked, cards };
}
function viewPlacement() {
  const P = UI.pt || (UI.pt = ptNew());
  const head = '<header class="sess"><button class="x" data-act="ptQuit" aria-label="Quit">✕</button>' + bar(P.phase === 'result' ? 1 : (P.lv - 1) / 5, 'sessbar') + '<span class="muted small">' + (P.phase === 'q' ? 'Level ' + P.lv + '/5' : 'Placement') + '</span></header>';
  let h = '';
  if (P.phase === 'intro') {
    h = '<h2>Placement test</h2><p>About <b>10–15 minutes</b>. You\'ll write real SQL (the app runs and grades it), predict outputs, and answer short pipeline scenarios. It gets harder as you go and stops when it finds your level.</p>' +
      '<ul class="plan small"><li>✍️ No self-rating: only answers count.</li><li>🤷 Use <b>I don\'t know</b> instead of guessing. It just counts as a miss.</li><li>🔒 ' + (isFreshUser() ? 'You can still open any lesson later.' : 'Your current progress, streak, XP and cards are never lowered or reset. The test can only unlock more.') + '</li><li>🔁 Lessons you test out of still come back as flashcard reviews.</li></ul>' +
      '<div class="actions"><button class="btn primary big" data-act="ptStart" data-autofocus>Start the test</button></div>';
  } else if (P.phase === 'q') {
    const c = P.cur, q = c.q;
    h = '<div class="kicker">' + (q.kind === 'sql' ? '💻 Write the SQL' : q.kind === 'predict' ? '🔮 Predict the output' : '🧠 Scenario') + ' · ' + esc(PLACE_LEVELS[P.lv].name) + '</div><div class="scenario">' + q.q + (q.code ? '<pre>' + esc(q.code) + '</pre>' : '') + '</div>';
    if (q.kind === 'sql') {
      h += '<details class="schema"><summary>Tables available</summary>' + DATASET_SCHEMA.map(s => '<div><code>' + s[0] + '</code>: ' + esc(s[1]) + '</div>').join('') + '</details>' +
        '<textarea class="mono editor" id="ptCode" rows="6" placeholder="Write your SQL here…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' + (c.checked ? ' disabled' : '') + '>' + esc(c.val) + '</textarea>' +
        (c.checked ? '' : '<div class="actions three"><button class="btn" data-act="ptRun">▶ Run</button><button class="btn primary" data-act="ptSubmit">✓ Submit</button><button class="btn ghost" data-act="ptIdk">I don\'t know</button></div>') +
        '<div class="out">' + c.out + '</div>';
    } else if (q.kind === 'predict') {
      h += '<div class="inputs"><label class="inp ' + (c.checked ? (c.ok ? 'ok' : 'bad') : '') + '"><span>=</span><input type="text" id="ptVal" value="' + esc(c.val) + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (c.checked ? ' disabled' : '') + ' data-autofocus placeholder="type the output"></label></div>' +
        (c.checked ? '' : '<div class="actions two"><button class="btn primary" data-act="ptSubmit">✓ Submit</button><button class="btn ghost" data-act="ptIdk">I don\'t know</button></div>');
    } else {
      h += '<div class="opts">' + c.opts.map((o, i) => '<button class="opt' + (c.checked ? (o === q.o[0] ? ' ok' : i === c.pick ? ' bad' : '') : '') + '" data-act="ptPick" data-i="' + i + '"' + (c.checked ? ' disabled' : '') + '>' + esc(o) + '</button>').join('') + '</div>' +
        (c.checked ? '' : '<div class="actions"><button class="btn ghost" data-act="ptIdk">I don\'t know</button></div>');
    }
    if (c.checked) {
      h += '<div class="feedback ' + (c.ok ? 'good' : 'badfb') + '">' + (c.ok ? '✅ Correct' : '✗ Not this time') + (c.msg ? ': ' + esc(c.msg) : '') + '</div>';
      if (q.kind === 'sql') h += '<div class="label">One correct solution</div><pre class="code">' + esc(q.sol) + '</pre>';
      else if (q.kind === 'predict') h += '<div class="hintbox">Answer: <b>' + esc(q.a[0]) + '</b>. ' + esc(q.why || '') + '</div>';
      else if (q.why) h += '<div class="hintbox">💡 ' + esc(q.why) + '</div>';
      h += '<div class="actions"><button class="btn primary big" data-act="ptContinue" data-autofocus>Continue</button></div>';
    }
  } else {
    const r = P.result; const lv = PLACE_LEVELS[r.level];
    const names = PLACE_LEVELS.filter(x => x.n >= 1 && x.n <= r.level).map(x => x.name);
    h = '<div class="big-emoji center">🧭</div><h2 class="center">Your level: ' + r.level + '/5</h2><p class="center"><b>' + esc(lv.name) + '</b></p>' +
      (r.top > r.level ? '<p class="small muted">You passed level ' + r.top + ' with a miss, so you\'re placed one level lower to be safe. Those lessons are quick wins.</p>' : '') +
      '<ul class="plan small">' + (names.length ? '<li>🔓 Tested out of: ' + esc(names.join(', ')) + ' (' + r.unlocked.lessons + ' lesson' + (r.unlocked.lessons === 1 ? '' : 's') + ')</li><li>🔁 ' + r.unlocked.cards + ' items from those lessons were added to your flashcards, spread over the next 3 weeks, so nothing is skipped forever.</li>' : '<li>📘 You\'ll start with lesson 1. That\'s the fastest path to solid foundations.</li>') +
      '<li>▶ Daily sessions now start from the first lesson you haven\'t tested out of.</li></ul>' +
      '<div class="actions"><button class="btn primary big" data-act="ptDone" data-autofocus>Go to today\'s session</button></div>';
  }
  return head + '<main class="step">' + h + '</main>';
}


/* ============================ v4 TERM ENGINE ============================
   Full rules: source/LEARNING_RULES.md. Summary:
   - Building blocks (GROUND) are grounded first: correct on 2 different days.
   - A term's tier is a definition split into phrases. ONE phrase at a time.
   - Each phrase climbs PICK (options) -> TYPE (no options) -> SPOT (use it in
     a real table/query/scenario). Each step needs a correct answer on a
     different calendar day; a term moves at most one step per day; a miss
     drops one step. After all phrases: whole-tier recall on a later day.
   - Tier 1 mastered -> flashcard (SM-2) + tier 2 unlocks 7 days later.
   - 2 terms active at once (3 when accuracy is high), each at its own pace.
   - Fast lane (v5): after >= 90% term accuracy on each of 4 counted study days
     in a row, up to 5 active terms and 2 new terms a day (see fast lane below).
   - State lives in localStorage 'deLearn.terms' only. deLearn.v1 and
     deLearn.ext are read for migration and never rewritten by it. */
const TERMS_KEY = 'deLearn.terms';
const FORMS = ['pick', 'type', 'spot'];
const TIER_NAMES = ['beginner', 'intermediate', 'advanced'];
const TIER_WAIT_DAYS = 7;
function defaultTerms() { return { v: 1, ground: {}, terms: {}, log: [], day: null, lastFill: null, helpSeen: null, migratedAt: null, daily: {}, fast: { on: false, since: null, off: null, why: null }, vis: {} }; }
function loadTerms() {
  const d = defaultTerms(); let raw = null;
  try { raw = localStorage.getItem(TERMS_KEY); } catch (e) {}
  if (!raw) return d;
  try { const o = JSON.parse(raw); const r = Object.assign(d, o); ['ground', 'terms', 'vis'].forEach(k => { if (!r[k] || typeof r[k] !== 'object') r[k] = {}; }); if (!Array.isArray(r.log)) r.log = []; return r; }
  catch (e) { return d; }
}
function saveTerms() { try { localStorage.setItem(TERMS_KEY, JSON.stringify(T)); } catch (e) {} }

/* ---------- precision words ----------
   [word, wrong replacement, why the replacement is inaccurate]. Used to
   (1) build near-miss distractors and (2) make typing strict: a typed phrase
   must contain every precision word of the accepted wording it matches. */
const PREC_SWAP = [
  ['one or more', 'one', '"one or more" allows several; "one" would allow only a single one.'],
  ['at least one', 'exactly one', '"at least one" means one or more; "exactly one" means one and no more.'],
  ['exactly one', 'at least one', '"exactly one" means one and no more; "at least one" would allow several.'],
  ['each', 'one', '"each" means it applies to every single one, one at a time; "one" would mean only a single one.'],
  ['every', 'one', '"every" covers all of them; "one" would mean only a single one.'],
  ['all', 'some', '"all" means none are left out; "some" would allow skipping some.'],
  ['only', 'also', '"only" excludes everything else; "also" would let other things in.'],
  ['before', 'after', 'Timing is the point here: "before" and "after" are opposites.'],
  ['after', 'before', 'Timing is the point here: "after" and "before" are opposites.'],
  ['first', 'last', '"first" and "last" are opposite ends.'],
  ['last', 'first', '"last" and "first" are opposite ends.'],
  ['previous', 'next', '"previous" looks back; "next" would look forward.'],
  ['left', 'right', 'LEFT and RIGHT decide which table keeps all of its rows.'],
  ['true', 'false', 'TRUE and FALSE are opposites.'],
  ['never', 'sometimes', '"never" allows no exceptions; "sometimes" would allow some.'],
  ['not', '', 'Dropping "not" flips the meaning.'],
  ['by', 'on', '"by" names what decides the result (sort by, group by, split by); "on" changes the meaning.'],
  ['many', 'one', '"many" and "one" change how many are involved.'],
  ['new', 'old', '"new" and "old" are opposites.']
];
const PREC_GROUPS = [['each', 'every', 'one', 'all'], ['one or more', 'one', 'exactly one', 'at least one'], ['by', 'on', 'from', 'in'], ['before', 'after'], ['first', 'last'], ['true', 'false', 'unknown'], ['left', 'right'], ['previous', 'next'], ['only', 'also'], ['never', 'sometimes', 'always'], ['many', 'one']];
const PREC_KEYS = [...new Set(PREC_SWAP.map(x => x[0]))].sort((a, b) => b.length - a.length);
const wordsIn = s => ' ' + String(s).toLowerCase().replace(/[^a-z0-9*%<>=!_]+/g, ' ').replace(/\b(row|column|value|table|group|expression)s\b/g, '$1').replace(/\s+/g, ' ').trim() + ' ';
function hasWord(s, w) { return wordsIn(s).includes(wordsIn(w)); }
function precWords(text) {
  let s = wordsIn(text); const out = [];
  PREC_KEYS.forEach(w => { const k = wordsIn(w); if (s.includes(k)) { out.push(w); s = s.split(k).join(' | '); } });
  return out;
}
function swapFirst(text, w, r) {
  const re = new RegExp('\\b' + w.replace(/ /g, '\\s+') + '\\b' + (r === '' ? '\\s*' : ''), 'i'); const m = text.match(re); if (!m) return null;
  const rep = r && m[0][0] === m[0][0].toUpperCase() && /[a-z]/i.test(m[0][0]) ? (m[0] === m[0].toUpperCase() ? r.toUpperCase() : r[0].toUpperCase() + r.slice(1)) : r;
  return text.replace(re, rep).replace(/\s+/g, ' ').trim();
}
function genSwaps(text) { const out = []; precWords(text).forEach(w => PREC_SWAP.filter(x => x[0] === w).forEach(x => { const v = swapFirst(text, w, x[1]); if (v && norm(v) !== norm(text)) out.push([v, x[2]]); })); return out; }

/* ---------- building the term models (T4) ---------- */
function bracePieces(text, pieces) {
  const low = text.toLowerCase(); let cur = 0, out = '', n = 0;
  pieces.forEach(p => { const i = low.indexOf(p.toLowerCase(), cur); if (i < 0) return; out += text.slice(cur, i) + '{' + text.slice(i, i + p.length) + '}'; cur = i + p.length; n++; });
  return n ? out + text.slice(cur) : '{' + text.replace(/\.$/, '') + '}.';
}
function autoTierDef(it) {
  const text = plain(it.text); const auth = TERM_BITES[it.id]; const wc = text.split(/\s+/).length;
  const pieces = auth && auth.bites ? auth.bites : wc >= BITE_MIN_WORDS ? autoPieces(text) : wc >= 8 ? autoPieces(text, 2) : [text.replace(/\.$/, '')];
  return bracePieces(text, pieces);
}
function parseTier(def, phs) {
  const segs = [], ph = []; const re = /\{(.+?)\}/g; let last = 0, m;
  while ((m = re.exec(def))) {
    if (m.index > last) segs.push({ s: def.slice(last, m.index) });
    const src = (phs && phs[ph.length]) || {}; const t = m[1];
    const a = [t].concat((src.a || []).filter(x => norm(x) !== norm(t))).slice(0, 3);
    segs.push({ s: t, p: ph.length }); ph.push({ t, a, d: src.d || [], spot: src.spot || null, ord: !!src.ord });
    last = re.lastIndex;
  }
  if (last < def.length) segs.push({ s: def.slice(last) });
  return { def: def.replace(/[{}]/g, ''), segs, ph };
}
const T4 = {};
Object.values(ITEMS).forEach(it => {
  if (it.kind !== 'term') return;
  const a = TERMS4[it.id]; const tiers = []; const autoT = parseTier(autoTierDef(it));
  if (a && a.t1) { tiers.push(parseTier(a.t1.def, a.t1.ph)); tiers.push(autoT); if (a.t3) tiers.push(parseTier(/\{/.test(a.t3) ? a.t3 : bracePieces(a.t3, autoPieces(a.t3)))); }
  else tiers.push(autoT);
  // v3 scenario questions become SPOT questions where no authored one exists
  const asp = (TERM_BITES[it.id] && TERM_BITES[it.id].aspects) || [];
  const tierWithPieces = tiers.find(tr => it.bite && tr.ph.length === it.bite.pieces.length && tr.ph.every((p, i) => norm(p.t) === norm(it.bite.pieces[i])));
  asp.forEach((x, j) => {
    if (x.piece != null && tierWithPieces && !tierWithPieces.ph[x.piece].spot) tierWithPieces.ph[x.piece].spot = { q: x.q, which: true, why: x.why, plain: true };
    else if (x.o) { for (const tr of tiers) { const k = tr.ph.length - 1 - (j % tr.ph.length); if (!tr.ph[k].spot) { tr.ph[k].spot = { q: x.q, o: x.o, why: x.why, plain: true }; break; } } }
  });
  T4[it.id] = { id: it.id, blocks: (TERM_BLOCKS[it.id] || []).filter(b => GROUND[b]), tiers, authored: !!(a && a.t1) };
});
// How many tiers an item mastered before v4 already covers: the existing definition is tier 2 for authored terms.
const tiersDoneOld = id => T4[id].authored ? 2 : 1;

/* ---------- term state ---------- */
function newPh(n) { return Array.from({ length: n }, () => ({ s: 0, up: null, miss: null, due: null, ivl: 0, seen: null, rn: 0 })); }
function newTermState(id, tier, st) { return { tier: tier || 0, ph: newPh(T4[id].tiers[tier || 0].ph.length), st: st || 'active', start: today(), lastUp: null, whole: null, done: {}, lapses: 0, floor: 0, peak: 0, origin: 'new' }; }
const activePhrase = ts => ts.ph.findIndex(p => p.s < 3);
const groundDone = b => !!(T.ground[b] && T.ground[b].done);
const blocksLeft = id => T4[id].blocks.filter(b => !groundDone(b));
function oldProgress(id) { const s = S.items[id]; if (!s) return 0; if (s.mastered) return 1; return isBite(id) && E.bites[id] ? Math.max(s.lvl / 5, biteFrac(id)) : s.lvl / 5; }
function termFrac4(ts) { if (!ts) return 0; if (ts.tier > 0 || ts.st === 'wait' || ts.st === 'done') return 1; return 0.9 * ts.ph.reduce((a, p) => a + p.s, 0) / (3 * ts.ph.length); }
// Shown progress never decreases: max of the old (v1/v3) progress, the migration floor and the best v4 progress so far.
function termShown(id) { const ts = T.terms[id]; return Math.max(oldProgress(id), ts ? Math.max(ts.floor || 0, ts.peak || 0, termFrac4(ts)) : 0); }

/* ---------- migration (additive, idempotent) ----------
   Terms in progress under v1/v3 get a v4 record with credit:
   v3 piece "known" -> PICK+TYPE credited (only SPOT missing); "typing" -> PICK credited.
   Old fade ladder: L2 -> phrase 1 PICK credited, L3 -> PICK on all phrases, L4 -> PICK+TYPE on all.
   Migrated terms start "paused": up to 2 become active by progress; the rest get gentle
   maintenance reviews (staggered, about 2 per day) until a slot frees up. */
function migrateTerms() {
  const t = today(); let k = 0;
  Object.keys(T4).forEach(id => {
    if (T.terms[id]) return;
    const st = S.items[id], b = E.bites[id];
    if ((st && st.mastered) || (!st && !b)) return;
    const ts = newTermState(id, 0, 'paused'); const n = ts.ph.length; const ph0 = T4[id].tiers[0].ph;
    ts.origin = b ? 'v3' : 'v1'; ts.floor = oldProgress(id); ts.peak = ts.floor; ts.start = (st && st.intro) || t;
    const credit = (i, s) => { if (i < n && ts.ph[i].s < s) { ts.ph[i].s = s; ts.ph[i].credit = ts.origin; ts.ph[i].seen = t; } };
    if (b) {
      const same = ITEMS[id].bite && b.p.length === n && ph0.every((p, i) => norm(p.t) === norm(ITEMS[id].bite.pieces[i]));
      if (b.c.l > 0) for (let i = 0; i < n; i++) credit(i, 2);
      else if (same) b.p.forEach((p, i) => credit(i, p.l >= 3 ? 2 : p.l === 2 ? 1 : 0));
      else { const known = b.p.filter(p => p.l >= 3).length, typing = b.p.filter(p => p.l === 2).length; const kc = Math.floor(known / b.p.length * n); for (let i = 0; i < kc; i++) credit(i, 2); if (typing && kc < n) credit(kc, 1); }
    } else { const L = st.lvl || 1; if (L === 2) credit(0, 1); else if (L === 3) for (let i = 0; i < n; i++) credit(i, 1); else if (L >= 4) for (let i = 0; i < n; i++) credit(i, 2); }
    ts.mdue = addDays(t, 1 + Math.floor(k++ / 2)); ts.mivl = 3;
    T.terms[id] = ts;
  });
  if (!T.migratedAt) T.migratedAt = t;
}

/* ---------- pacing (term material only, never code) ---------- */
function t4Log(ok) { T.log.push({ d: today(), ok: ok ? 1 : 0 }); if (T.log.length > 40) T.log.splice(0, T.log.length - 40); fastDayLog(ok); fastCheckOff(); }

/* ---------- fast lane (v5): more terms in parallel, only with CONSISTENT accuracy ----------
   ON  (checked when a session is planned): the last FAST_DAYS (4) counted study days were
       each >= 90% correct. A counted day has >= FAST_MIN_N (5) term answers; days with fewer
       answers, or no study, neither count nor break the run. Only days after the last
       switch-off count, so a slip always needs a fresh run of 4. The rolling accuracy
       (last 20 term answers) must also be >= 85% when there are at least 10.
   OFF (checked after every term answer, so at once): today has >= 5 answers and < 90%
       correct, or the rolling accuracy over the last 20 answers (>= 10) drops below 85%.
       Back to the normal pace: 2-3 active terms, at most 1 new term a day; extra active
       terms are paused (kept with full credit, gentle maintenance) at the next plan.
   WHILE ON: up to FAST_MAX_ACTIVE (5) active terms and FAST_NEW_PER_DAY (2) new terms a
       day. Every per-term rule is unchanged (blocks first, one phrase at a time, pick /
       type / spot on different days, precision words). The term budget (1/3 split) is
       unchanged too, so active terms rotate inside it: least recently asked first.
   State (additive fields in deLearn.terms): T.daily {date: {n, ok}} for the last 60
   days, T.fast {on, since, off, why}. */
const FAST_DAYS = 4, FAST_MIN_N = 5, FAST_DAY_ACC = 0.9, FAST_ROLL_ACC = 0.85, FAST_ROLL_MIN = 10, FAST_MAX_ACTIVE = 5, FAST_NEW_PER_DAY = 2;
function fastState() {
  if (!T.daily || typeof T.daily !== 'object') T.daily = {};
  if (!T.fast || typeof T.fast !== 'object') T.fast = { on: false, since: null, off: null, why: null };
  return T.fast;
}
function fastDayLog(ok) { fastState(); const t = today(); const d = T.daily[t] || (T.daily[t] = { n: 0, ok: 0 }); d.n++; if (ok) d.ok++; const ks = Object.keys(T.daily).sort(); if (ks.length > 60) ks.slice(0, ks.length - 60).forEach(k => delete T.daily[k]); }
function fastRoll() { const l = T.log.slice(-20); return l.length >= FAST_ROLL_MIN ? l.filter(x => x.ok).length / l.length : null; }
function fastRun() {
  const f = fastState(); const days = Object.keys(T.daily).filter(d => T.daily[d].n >= FAST_MIN_N && (!f.off || d > f.off)).sort();
  let run = 0; for (let i = days.length - 1; i >= 0; i--) { const x = T.daily[days[i]]; if (x.ok / x.n >= FAST_DAY_ACC) run++; else break; } return run;
}
function fastCheckOff() {
  const f = fastState(); if (!f.on) return false; const t = today(), d = T.daily[t], roll = fastRoll();
  let why = null;
  if (d && d.n >= FAST_MIN_N && d.ok / d.n < FAST_DAY_ACC) why = 'today ' + Math.round(d.ok / d.n * 100) + '% (below 90%)';
  else if (roll !== null && roll < FAST_ROLL_ACC) why = 'recent ' + Math.round(roll * 100) + '% (below 85%)';
  if (!why) return false; f.on = false; f.off = t; f.why = why; return true;
}
function fastCheckOn() {
  const f = fastState(); fastCheckOff(); if (f.on) return true; const roll = fastRoll();
  if (fastRun() >= FAST_DAYS && (roll === null || roll >= FAST_ROLL_ACC)) { f.on = true; f.since = today(); f.why = null; }
  return f.on;
}
function paceInfo4() {
  if (fastCheckOn()) { const r = fastRoll(); return { mode: 'lane', miss: r === null ? 0 : 1 - r, maxActive: FAST_MAX_ACTIVE, ground: 3, newStart: true, newPerDay: FAST_NEW_PER_DAY, extra: 0, rotate: true, note: '⚡ Fast lane on: consistent accuracy (90%+ on ' + FAST_DAYS + ' study days in a row). Up to ' + FAST_MAX_ACTIVE + ' terms at once and ' + FAST_NEW_PER_DAY + ' new a day; each term still needs pick, type and spot on different days.' }; }
  const offNote = T.fast && T.fast.off && T.fast.off >= addDays(today(), -1) ? '⚡ Fast lane off: ' + (T.fast.why || 'accuracy dipped') + '. Back to the normal pace (2–3 terms, 1 new a day). ' : '';
  const p = paceInfo4base(); if (offNote) p.note = offNote + p.note; return p;
}
function paceInfo4base() {
  const log = T.log.slice(-20); const n = log.length; const miss = n ? log.filter(x => !x.ok).length / n : 0;
  if (n >= 8 && miss > 0.35) return { mode: 'slow', miss, maxActive: 2, ground: 1, newStart: false, extra: 2, note: '🐢 Slowing down today to strengthen weak terms (' + Math.round(miss * 100) + '% of recent term answers missed). Code practice is unchanged.' };
  if (n >= 12 && miss < 0.12) return { mode: 'fast', miss, maxActive: 3, ground: 3, newStart: true, extra: 0, note: '🚀 Your term answers are accurate lately, so a third term can run in parallel.' };
  return { mode: 'normal', miss, maxActive: 2, ground: 2, newStart: true, extra: 0, note: '' };
}

/* ---------- daily term plan ----------
   Terms get about 1/3 of the session by item count: budget = round(other items / 2)
   (min 2, max 10). Roughly 2/3 of it opens the session (grounding + one advancing
   question per active term), 1/3 closes it (reviews of mastered phrases, due term
   flashcards, maintenance of paused terms, extra weak reviews when pacing is slow). */
function termBudget(other) { return Math.max(2, Math.min(10, Math.round(other / 2))); }
function newTermQueue(extraLesson) {
  const out = [];
  orderedReadyModules().forEach(m => m.lessons.forEach(l => { if (!((S.theory[l.id] || l.id === extraLesson) && visSeen(l.id))) return; /* v6: illustrated lessons' terms wait until the pictures were seen */ l.itemIds.forEach(id => { if (T4[id] && !T.terms[id] && !(S.items[id] && S.items[id].mastered) && !S.cards[id]) out.push(id); }); }));
  return out;
}
function tierUpQueue() {
  const t = today(); const out = Object.keys(T.terms).filter(id => T4[id] && inScope(id) && T.terms[id].st === 'wait' && T.terms[id].wait <= t);
  Object.keys(T4).forEach(id => { if (inScope(id) && !T.terms[id] && S.items[id] && S.items[id].mastered && T4[id].tiers.length > tiersDoneOld(id) && S.cards[id] && (S.cards[id].added || '') <= addDays(t, -TIER_WAIT_DAYS)) out.push(id); });
  return out;
}
function planTerms(other, theoryLesson) {
  const t = today(), pace = paceInfo4(), DK = SCOPE === 'aws' ? 'dayAws' : 'day', day = (T[DK] && T[DK].d === t) ? T[DK] : { d: t, newTerms: 0 };
  const budget = termBudget(other);
  const active = Object.keys(T.terms).filter(id => T4[id] && inScope(id) && T.terms[id].st === 'active');
  const activate = [], starts = [];
  const paused = Object.keys(T.terms).filter(id => T4[id] && inScope(id) && T.terms[id].st === 'paused').sort((a, b) => termShown(b) - termShown(a));
  const tierUps = tierUpQueue(), fresh = newTermQueue(theoryLesson);
  // more active terms than the pace allows (the fast lane just turned off): pause the
  // ones with least progress; they keep all credit and get gentle maintenance
  const keepMax = pace.mode === 'lane' ? FAST_MAX_ACTIVE : 3; // normal/slow pace never pauses the 3rd term of the old 'fast' mode
  const pause = active.length > keepMax ? active.sort((a, b) => termShown(b) - termShown(a)).splice(keepMax) : [];
  if (pace.rotate) active.sort((a, b) => (T.terms[a].asked || '') < (T.terms[b].asked || '') ? -1 : (T.terms[a].asked || '') > (T.terms[b].asked || '') ? 1 : 0);
  let slots = pace.maxActive - active.length;
  while (slots > 0 && paused.length) { activate.push(paused.shift()); slots--; }
  let newLeft = (pace.newStart || active.length + activate.length === 0) ? Math.max(0, (pace.newPerDay || 1) - (day.newTerms || 0)) : 0; let lastFill = T.lastFill;
  while (slots > 0 && (tierUps.length || (newLeft && fresh.length))) {
    if ((lastFill === 'new' || !(newLeft && fresh.length)) && tierUps.length) { const id = tierUps.shift(); (T.terms[id] ? activate : starts).push(T.terms[id] ? id : { id, tier: tiersDoneOld(id) }); lastFill = 'tier'; }
    else { starts.push({ id: fresh.shift(), tier: 0 }); newLeft--; lastFill = 'new'; }
    slots--;
  }
  const ids = active.concat(activate, starts.map(s => s.id));
  const open = []; let gLeft = pace.ground; const gSeen = new Set();
  ids.forEach(id => {
    const ts = T.terms[id]; const bl = blocksLeft(id);
    if (bl.length) { bl.forEach(b => { const g = T.ground[b]; if (gLeft > 0 && !gSeen.has(b) && !(g && g.ok === t) && !(g && g.miss === t)) { open.push({ type: 'term', k: 'ground', id, g: b }); gSeen.add(b); gLeft--; } }); return; }
    if (ts && ts.lastUp === t) return;
    const pi = ts ? activePhrase(ts) : 0;
    if (pi >= 0) { if (!(ts && ts.ph[pi].miss === t)) open.push({ type: 'term', k: 'adv', id }); }
    else if (ts.whole !== t) open.push({ type: 'term', k: 'whole', id });
  });
  const close = [];
  const phReviews = []; Object.keys(T.terms).forEach(id => { const ts = T.terms[id]; if (!T4[id] || !inScope(id) || ts.st === 'paused' || ts.st === 'wait' || ts.st === 'done') return; ts.ph.forEach((p, i) => { if (p.s === 3 && p.due && p.due <= t) phReviews.push({ type: 'term', k: 'review', id, p: i, due: p.due }); }); });
  phReviews.sort((a, b) => a.due < b.due ? -1 : 1);
  const maint = Object.keys(T.terms).filter(id => T4[id] && inScope(id) && T.terms[id].st === 'paused' && !activate.includes(id) && T.terms[id].mdue && T.terms[id].mdue <= t && T.terms[id].ph.some(p => p.s >= 1)).sort((a, b) => T.terms[a].mdue < T.terms[b].mdue ? -1 : 1).map(id => ({ type: 'term', k: 'maint', id }));
  const tcards = Object.keys(S.cards).filter(id => ITEMS[id] && inScope(id) && ITEMS[id].kind === 'term' && S.cards[id].due <= t).sort((a, b) => S.cards[a].due < S.cards[b].due ? -1 : 1).map(id => ({ type: 'card', id, term: true }));
  const extra = [];
  if (pace.extra) ids.filter(id => T.terms[id]).filter(id => { const ts = T.terms[id]; return ts.lapses >= 2 || ts.ph.some(p => p.miss && p.miss >= addDays(t, -7)); }).slice(0, pace.extra).forEach(id => { if (activePhrase(T.terms[id]) >= 0) extra.push({ type: 'term', k: 'practice', id, extra: true }); });
  // interleave so no single kind crowds out the others
  // lowest priority filler: one same-day practice (no step change) per active term, so the end review is never empty
  const fill = ids.filter(id => !blocksLeft(id).length && !extra.some(x => x.id === id) && (!T.terms[id] || activePhrase(T.terms[id]) >= 0)).map(id => ({ type: 'term', k: 'practice', id }));
  const pools = [extra, phReviews, maint, tcards]; let more = true;
  while (more) { more = false; pools.forEach(pl => { if (pl.length) { close.push(pl.shift()); more = true; } }); }
  close.push(...fill);
  let closeN = Math.min(close.length, Math.max(1, Math.round(budget / 3)));
  let openN = Math.min(open.length, budget - closeN);
  if (!openN && open.length) { openN = 1; closeN = Math.min(closeN, budget - 1); }
  closeN = Math.min(close.length, budget - openN);
  return { scope: SCOPE, open: open.slice(0, openN), close: close.slice(0, closeN), activate, starts, pause, pace, budget, waiting: Math.max(0, open.length - openN) + Math.max(0, close.length - closeN) };
}
// Called when a session starts: the plan's activations and new starts become real state.
function commitTermPlan(tp) {
  if (!tp) return; const t = today();
  (tp.pause || []).forEach(id => { const ts = T.terms[id]; if (!ts || ts.st !== 'active') return; ts.st = 'paused'; if (!ts.mdue || ts.mdue < addDays(t, 1)) { ts.mdue = addDays(t, 1); ts.mivl = ts.mivl || 3; } });
  tp.activate.forEach(id => { T.terms[id].st = 'active'; });
  tp.open.forEach(s => { if (T.terms[s.id]) T.terms[s.id].asked = t; });
  tp.starts.forEach(s => { if (T.terms[s.id] && T.terms[s.id].st === 'active') return; const ts = newTermState(s.id, s.tier, 'active'); ts.asked = t; if (s.tier > 0) { ts.origin = 'tierup'; ts.floor = 1; ts.peak = 1; } T.terms[s.id] = ts; if (s.tier === 0) { const DK = tp.scope === 'aws' ? 'dayAws' : 'day'; if (!T[DK] || T[DK].d !== t) T[DK] = { d: t, newTerms: 0 }; T[DK].newTerms++; T.lastFill = 'new'; } else T.lastFill = 'tier'; });
  saveTerms();
}

/* ---------- answer checking ---------- */
function coverage(input, alt, ord) {
  const have = tokens(input); if (!have.length) return false;
  // ord: every word counts (clause lists like FROM, WHERE …); otherwise only content words
  const want = tokens(alt).filter(x => ord ? x.length >= 2 : x.length >= 3 && !STOP.has(x)); if (!want.length) return norm(input) === norm(alt);
  const at = w => { let i = have.indexOf(w); if (i < 0 && w.length >= 5) i = have.findIndex(h => Math.abs(h.length - w.length) <= 1 && lev(h, w) <= 1); return i; };
  const pos = want.map(at); const got = pos.filter(i => i >= 0);
  if (got.length / want.length < (ord ? 1 : 0.75)) return false;
  if (ord) for (let i = 1; i < got.length; i++) if (got[i] < got[i - 1]) return false;
  return true;
}
/* Typed answer for one phrase. Accepted: any accepted wording, with small typos in
   long content words. NOT accepted: a missing/changed precision word (each, by,
   one or more, TRUE...), or an added "not"/"never". Returns {ok, alt} or {ok:false, prec}. */
function checkPhrase(input, ph) {
  if (!norm(input)) return { ok: false };
  let precFail = null;
  for (const a of ph.a) {
    const near = ph.ord ? coverage(input, a, true) : norm(a) === norm(input) || checkBlank(input, [a], true) || coverage(input, a, false);
    if (!near) continue;
    const miss = precWords(a).filter(w => !hasWord(input, w));
    const added = ['not', 'never', 'no'].filter(w => hasWord(input, w) && !hasWord(a, w));
    if (!miss.length && !added.length) return { ok: true, alt: a };
    if (!precFail) {
      if (added.length) precFail = { want: '', got: added[0], why: 'Adding "' + added[0] + '" flips the meaning.' };
      else { const w = miss[0]; const sw = PREC_SWAP.find(x => x[0] === w && x[1] && hasWord(input, x[1])); precFail = { want: w, got: sw ? sw[1] : null, why: sw ? sw[2] : 'The small word "' + w + '" is part of the precise wording here.' }; }
    }
  }
  return { ok: false, prec: precFail };
}
function phraseDistractors(id, ti, pi, n) {
  const ph = T4[id].tiers[ti].ph[pi]; const out = []; const seen = new Set(ph.a.map(norm));
  const add = (t, why) => { const k = norm(t); if (!t || seen.has(k)) return; seen.add(k); out.push({ t, why }); };
  ph.d.forEach(x => add(x[0], x[1]));
  genSwaps(ph.t).forEach(x => add(x[0], x[1]));
  if (out.length < n) { // last resort: phrases of other terms in the same lesson
    const it = ITEMS[id]; const wc = ph.t.split(/\s+/).length; const pool = [];
    Object.keys(T4).forEach(o => { if (o !== id && ITEMS[o].lesson === it.lesson) T4[o].tiers[0].ph.forEach(p => pool.push({ t: p.t, d: Math.abs(p.t.split(/\s+/).length - wc), f: ITEMS[o].front })); });
    shuffle(pool).sort((a, b) => a.d - b.d).forEach(p => add(p.t, 'That phrase belongs to "' + p.f + '".'));
  }
  if (out.length < n) { // v7: short lessons (2 terms) borrow from the lesson just before in the same module
    const L = LESSONS[ITEMS[id].lesson]; const m = modOf(L); const prev = m && m.lessons[m.lessons.indexOf(L) - 1];
    if (prev) Object.keys(T4).forEach(o => { if (ITEMS[o].lesson === prev.id) T4[o].tiers[0].ph.forEach(p => add(p.t, 'That phrase belongs to "' + ITEMS[o].front + '".')); });
  }
  return out.slice(0, n);
}
function spotQuestion(id, ti, pi) {
  const tr = T4[id].tiers[ti], ph = tr.ph[pi];
  if (ph.spot) { if (ph.spot.which) return { q: ph.spot.q, o: [ph.t].concat(tr.ph.filter((x, i) => i !== pi).map(x => x.t)), why: ph.spot.why, plain: true }; return ph.spot; }
  // fallback: spot the accurate full definition among near-miss versions of THIS phrase
  const ds = phraseDistractors(id, ti, pi, 3);
  return { q: 'Spot the <b>accurate</b> definition of <b>' + esc(ITEMS[id].front) + '</b>.', o: [tr.def].concat(ds.map(d => tr.def.replace(ph.t, d.t))), why: 'The accurate version says "' + ph.t + '". ' + (ds[0] ? ds[0].why : ''), auto: true };
}
function precDrill(ph) {
  const w = precWords(ph.t).find(x => PREC_GROUPS.some(g => g.includes(x))); if (!w) return null;
  const g = PREC_GROUPS.find(x => x.includes(w)); const re = new RegExp('\\b' + w.replace(/ /g, '\\s+') + '\\b', 'i'); const m = ph.t.match(re); if (!m) return null;
  return { word: m[0], shown: ph.t.replace(re, '____'), opts: shuffle(g.slice(0, 4).map(x => m[0] === m[0].toUpperCase() && /[a-z]/i.test(m[0]) ? x.toUpperCase() : x)) };
}

/* ---------- answering: the mastery rules ---------- */
function answerGround(g, ok) {
  const t = today(); const s = T.ground[g] || (T.ground[g] = { ok: null, done: null, n: 0, miss: null, seen: t }); s.n++; let ev;
  if (ok) { if (s.done) ev = 'keep'; else if (s.ok && s.ok !== t && s.miss !== t) { s.done = t; ev = 'grounded'; } else { if (!s.ok && s.miss !== t) s.ok = t; ev = 'half'; } }
  else { ev = s.done ? 'keep' : s.ok ? 'down' : 'stay'; if (!s.done) s.ok = null; s.miss = t; }
  return ev;
}
function finishTier(id) {
  const ts = T.terms[id], t = today(); ts.done[ts.tier] = t;
  if (ts.tier === 0 || !(S.items[id] && S.items[id].mastered)) { const st = itemState(id); st.mastered = true; addCard(id); }
  const next = ts.tier + 1;
  if (T4[id].tiers[next]) { ts.tier = next; ts.ph = newPh(T4[id].tiers[next].ph.length); ts.st = 'wait'; ts.wait = addDays(t, TIER_WAIT_DAYS); ts.whole = null; }
  else ts.st = 'done';
  ts.peak = 1;
}
function answerTerm(step, ok) {
  const t = today(); const id = step.id; const ts = T.terms[id]; let ev = 'stay', xp = ok ? 3 : 1;
  if (step.retry) { addXP(1); save(); return { event: ok ? 'practice' : 'stay', correct: ok, retry: true }; }
  if (step.k === 'ground') { ev = answerGround(step.g, ok); }
  else if (step.k === 'adv') {
    const pi = activePhrase(ts); const ph = ts.ph[pi]; ts.last = t;
    if (ok) {
      if (ts.lastUp !== t && ph.miss !== t) { ph.s++; ph.up = t; ts.lastUp = t; xp = 3 + ph.s; if (ph.s === 3) { ph.ivl = 3; ph.due = addDays(t, 3); ev = activePhrase(ts) < 0 ? 'allph' : 'phrase'; } else ev = 'up'; }
      else ev = 'practice';
    } else { const b = ph.s; ph.s = Math.max(0, ph.s - 1); ph.miss = t; ts.lapses++; ev = ph.s < b ? 'down' : 'stay'; }
  } else if (step.k === 'whole') {
    if (ok && ts.lastUp !== t) { ts.lastUp = t; ts.whole = t; finishTier(id); ev = 'tier'; xp = 10; } else if (ok) ev = 'practice'; else { ts.whole = t; ev = 'stay'; }
  } else if (step.k === 'review') {
    const ph = ts.ph[step.p]; ph.rn = (ph.rn || 0) + 1;
    if (ok) { ph.ivl = Math.min(60, (ph.ivl || 3) * 2); ph.due = addDays(t, ph.ivl); ev = 'review'; xp = 4; }
    else { ph.s = 2; ph.miss = t; ph.due = null; ts.lapses++; ev = 'down'; }
  } else if (step.k === 'maint') {
    const ph = ts.ph[step.p];
    if (ok) { ts.mivl = Math.min(30, (ts.mivl || 3) * 2); ts.mdue = addDays(t, ts.mivl); ev = 'review'; xp = 4; }
    else { const b = ph.s; ph.s = Math.max(0, ph.s - 1); ph.miss = t; ts.mdue = addDays(t, 1); ts.lapses++; ev = ph.s < b ? 'down' : 'stay'; }
  } else if (step.k === 'practice') { ev = ok ? 'practice' : 'stay'; xp = ok ? 2 : 1; }
  if (ts) ts.peak = Math.max(ts.peak || 0, termFrac4(ts));
  t4Log(ok); addXP(xp); save();
  return { event: ev, correct: ok };
}

/* ---------- session steps for terms ---------- */
function initTerm(step) {
  const t = today(); const f = { term: true, step, checked: false, vals: [], kind: step.k };
  if (step.k === 'ground') {
    const G = GROUND[step.g]; const s = T.ground[step.g]; f.G = G; f.intro = !s; f.q = G.qs[(s ? s.n : 0) % G.qs.length];
  } else {
    const ts = T.terms[step.id]; const ti = ts.tier; const tr = T4[step.id].tiers[ti]; f.ti = ti; f.tr = tr;
    let pi = step.k === 'adv' || step.k === 'practice' ? activePhrase(ts) : step.k === 'review' ? step.p : -1;
    if (step.k === 'maint') { pi = -1; ts.ph.forEach((p, i) => { if (p.s >= 1) pi = i; }); step.p = pi; }
    f.pi = pi;
    if (step.k === 'whole') { f.form = 'whole'; }
    else {
      const ph = ts.ph[pi]; f.ph = tr.ph[pi];
      f.form = step.k === 'adv' ? FORMS[ph.s] : step.k === 'practice' ? 'pick' : step.k === 'maint' ? (ph.s >= 2 ? 'type' : 'pick') : ((ph.rn || 0) % 2 === 1 && precDrill(f.ph) ? 'prec' : 'type');
      if (step.k === 'adv' && !ph.seen) { f.intro = true; ph.seen = t; saveTerms(); }
    }
  }
  if (f.kind === 'ground' || f.form === 'spot') { const q = f.kind === 'ground' ? f.q : (f.q = spotQuestion(step.id, f.ti, f.pi)); if (q.o) { f.opts = shuffle(q.o.map((x, i) => ({ x, i }))); } }
  if (f.form === 'pick') { const ds = phraseDistractors(step.id, f.ti, f.pi, 3); f.opts = shuffle([{ x: f.ph.t, i: 0 }].concat(ds.map((d, i) => ({ x: d.t, i: i + 1, why: d.why })))); }
  if (f.form === 'prec') { f.pd = precDrill(f.ph); }
  f.snap = JSON.stringify({ ts: T.terms[step.id] || null, g: step.g ? T.ground[step.g] || null : null, log: T.log.length, dd: (T.daily || {})[today()] || null, fast: T.fast || null });
  return f;
}
function termDefHTML(f, blank) {
  const ts = T.terms[f.step.id];
  return f.tr.segs.map(sg => {
    if (sg.p == null) return esc(sg.s);
    if (sg.p === f.pi && blank) return '<span class="slot' + (f.checked ? (f.ok ? ' ok' : ' bad') : f.pick != null ? ' filled' : '') + '">' + (f.checked ? esc(sg.s) : f.pick != null && f.opts ? esc(f.opts[f.pick].x) : '\u00a0'.repeat(12)) + '</span>';
    const s = ts.ph[sg.p].s; return '<span class="pc' + (sg.p === f.pi ? ' cur' : s >= 3 ? ' known' : ' later') + '">' + esc(sg.s) + '</span>';
  }).join('');
}
function phrasePips(ts, ti) {
  return '<div class="pips">' + ts.ph.map((p, i) => '<span class="ph' + (i === activePhrase(ts) ? ' cur' : '') + '" title="phrase ' + (i + 1) + '">' + FORMS.map((fm, k) => '<i class="' + (p.s > k ? 'l3' : '') + '"></i>').join('') + '</span>').join('') +
    '<span>' + ts.ph.filter(p => p.s >= 3).length + '/' + ts.ph.length + ' phrases · tier ' + (ti + 1) + ' (' + TIER_NAMES[ti] + ')</span></div>';
}
function optsHTML(f, act) {
  return '<div class="opts">' + f.opts.map((o, i) => '<button class="opt' + (f.checked ? (o.i === 0 ? ' ok' : i === f.pick ? ' bad' : '') : '') + '" data-act="' + act + '" data-i="' + i + '"' + (f.checked ? ' disabled' : '') + '>' + (f.html ? o.x : esc(o.x)) + '</button>').join('') + '</div>';
}
function tapHTML(f, q) {
  const parts = q.tap.map((p, i) => p[1] == null ? '<span>' + p[0] + '</span>' : '<button class="tap' + (q.inline ? ' inl' : ' blk') + (f.checked ? (p[1] === 1 ? ' ok' : i === f.pick ? ' bad' : '') : '') + '" data-act="tTap" data-i="' + i + '"' + (f.checked ? ' disabled' : '') + '>' + p[0] + '</button>').join(q.inline ? '' : '');
  return q.inline ? '<div class="tapline mono">' + parts + '</div>' : '<div class="tapgrid">' + parts + '</div>';
}
function viewTerm(step) {
  if (!F || F.stepIndex !== SESSION.i) { F = initTerm(step); F.stepIndex = SESSION.i; }
  const f = F, it = ITEMS[step.id], L = LESSONS[it.lesson]; let h = '';
  if (f.kind === 'ground') {
    h += '<div class="kicker">🧱 Building block · <b>' + esc(f.G.name) + '</b>' + (f.intro ? ' · <b class="new">NEW</b>' : '') + ' · used by ' + esc(it.front) + '</div>';
    if (f.intro) h += '<div class="teach">' + f.G.teach + '</div>';
    const g = T.ground[step.g]; h += '<div class="muted small">Grounded after a correct answer on 2 different days' + (g && g.ok ? ' · 1/2 ✓' : '') + '</div>';
    h += '<h2 class="q">' + f.q.q + '</h2>' + (f.q.show ? '<div class="scene">' + f.q.show + '</div>' : '');
    f.html = true; h += f.q.tap ? tapHTML(f, f.q) : optsHTML(f, 'tPick');
  } else {
    const ts = T.terms[step.id];
    h += '<div class="kicker">🧩 Term · ' + esc(L.title) + (f.intro ? ' · <b class="new">NEW PHRASE</b>' : '') + (step.extra ? ' · <b class="new">EXTRA REVIEW</b>' : '') + (step.k === 'review' || step.k === 'maint' ? ' · review' : '') + '</div>' + phrasePips(ts, f.ti);
    const formName = { pick: 'PICK: choose the exact phrase', type: 'TYPE: write the phrase (no options)', spot: 'SPOT: use it in a real example', whole: 'Whole definition from memory', prec: 'Precision: choose the exact small word' }[f.form];
    h += '<div class="muted small">' + formName + '</div><h2>' + esc(it.front) + '</h2>';
    if (f.intro && f.pi === 0 && f.ti === 0 && AWS_HOOKS[step.id]) h += hookHTML(step.id, 'first');
    if (f.intro) h += '<div class="teach">New phrase ' + (f.pi + 1) + ' of ' + f.tr.ph.length + ': <b>' + esc(f.ph.t) + '</b>' + (precWords(f.ph.t).length ? '<br><span class="small">Watch the exact small word' + (precWords(f.ph.t).length > 1 ? 's' : '') + ': ' + precWords(f.ph.t).map(w => '<b>' + esc(w) + '</b>').join(', ') + '</span>' : '') + (f.ph.a.length > 1 ? '<br><span class="small muted">Also accepted: ' + f.ph.a.slice(1).map(esc).join(' · ') + '</span>' : '') + '</div>';
    if (f.form === 'pick') { h += '<p class="def">' + termDefHTML(f, true) + '</p>' + optsHTML(f, 'tPick'); }
    else if (f.form === 'type') { h += '<p class="def">' + termDefHTML(f, true) + '</p><div class="inputs"><label class="inp ' + (f.checked ? (f.ok ? 'ok' : 'bad') : '') + '"><span>?</span><input type="text" data-i="0" value="' + esc(f.vals[0] || '') + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' + (f.checked ? ' disabled' : '') + ' data-autofocus placeholder="' + f.ph.t.split(/\s+/).length + ' words"></label></div>'; }
    else if (f.form === 'prec') { h += '<p class="def model">' + esc(f.pd.shown) + '</p>'; f.opts = f.opts || f.pd.opts.map(x => ({ x, i: norm(x) === norm(f.pd.word) ? 0 : 1 })); h += optsHTML(f, 'tPick'); }
    else if (f.form === 'spot') { h += '<p class="def">' + termDefHTML(f, false) + '</p><h3 class="q">' + (f.q.plain ? esc(f.q.q) : f.q.q) + '</h3>' + (f.q.show ? '<div class="scene">' + f.q.show + '</div>' : ''); f.html = !(f.q.auto || f.q.plain); h += f.q.tap ? tapHTML(f, f.q) : optsHTML(f, 'tPick'); }
    else if (f.form === 'whole') { h += '<p class="muted">Write the whole tier ' + (f.ti + 1) + ' definition. Every phrase must be there, with its exact small words.</p><textarea class="recall" rows="4" data-i="0" autocomplete="off" autocapitalize="off" spellcheck="false"' + (f.checked ? ' disabled' : '') + ' data-autofocus>' + esc(f.vals[0] || '') + '</textarea>'; }
  }
  if (!f.checked) {
    if (f.form === 'type' || f.form === 'whole') h += '<div class="actions"><button class="btn primary big" data-act="tCheck">Check</button><button class="btn ghost" data-act="tIdk">I don\'t know: show me</button></div>';
    else h += '<div class="actions"><button class="btn ghost" data-act="tIdk">I don\'t know: show me</button></div>';
  } else if (f.form === 'whole' && !f.graded) {
    h += '<div class="feedback ' + (f.wres.every(Boolean) ? 'good' : 'meh') + '"><b>' + f.wres.filter(Boolean).length + '/' + f.wres.length + ' phrases found</b>' + (f.wres.some(x => !x) ? '<br>Missing or imprecise: ' + f.tr.ph.filter((p, i) => !f.wres[i]).map(p => '<code>' + esc(p.t) + '</code>').join(' ') : '') + '</div>' +
      '<div class="label">Model answer</div><p class="def model">' + esc(f.tr.def) + '</p><div class="muted small">Same meaning with the exact small words counts. You decide:</div>' +
      '<div class="actions two"><button class="btn bad" data-act="tSelf" data-ok="0">✗ Not yet</button><button class="btn good' + (f.wres.every(Boolean) ? ' primary' : '') + '" data-act="tSelf" data-ok="1">✓ I had it</button></div>';
  } else {
    const o = f.outcome; let msg;
    const nextForm = { up: '', phrase: '' };
    if (o.correct) msg = o.retry ? '✅ Correct (practice: it counts again tomorrow).' : o.event === 'grounded' ? '🧱 Grounded! This building block is now reused by every term that needs it.' : o.event === 'half' ? '✅ Correct! Get it right again on another day to ground it.' : o.event === 'up' ? '⬆️ Step done. Tomorrow: the next form of this phrase.' : o.event === 'phrase' ? '🎯 Phrase mastered (pick, type and spot). The next phrase starts on another day.' : o.event === 'allph' ? '🎉 Every phrase is mastered. On another day: the whole definition.' : o.event === 'tier' ? '🏆 Tier mastered! It joins your flashcards; the next tier unlocks in ' + TIER_WAIT_DAYS + ' days.' : o.event === 'review' ? '✅ Still solid. Next review later.' : '✅ Correct (already stepped up today; it counts again tomorrow).';
    else msg = o.event === 'down' ? '↩️ Not quite. This phrase drops back one step.' : '↩️ Not quite. You\'ll see it again.';
    h += '<div class="feedback ' + (o.correct ? 'good' : 'badfb') + '">' + msg + '</div>';
    if (!o.correct && f.kind !== 'ground' && AWS_HOOKS[step.id]) h += hookHTML(step.id, 'hint');
    if (f.precFail) h += '<div class="hintbox">🎯 Precision: ' + (f.precFail.got ? '"' + esc(f.precFail.got) + '" instead of "' + esc(f.precFail.want) + '". ' : '') + esc(f.precFail.why) + '</div>';
    if (f.pickWhy) h += '<div class="hintbox">💡 ' + esc(f.pickWhy) + '</div>';
    const why = f.kind === 'ground' ? f.q.why : f.form === 'spot' ? f.q.why : null; if (why) h += '<div class="hintbox">💡 ' + esc(why) + '</div>';
    if (f.ph && f.form !== 'whole') { h += '<div class="small">Exact phrase: <b>' + esc(f.ph.t) + '</b>' + (f.ph.a.length > 1 ? '<br><span class="muted">Also accepted: ' + f.ph.a.slice(1).map(esc).join(' · ') + '</span>' : '') + '</div>'; }
    h += '<div class="actions"><button class="btn primary big" data-act="next" data-autofocus>Continue</button>' + (!o.correct && f.form === 'type' && !f.overridden && !f.precFail ? '<button class="btn ghost" data-act="tOverride">I was actually right (typo or synonym)</button>' : '') + '</div>';
  }
  return h;
}
function finishTerm(ok) {
  const step = SESSION.steps[SESSION.i]; const o = answerTerm(step, ok); F.checked = true; F.ok = ok; F.outcome = o;
  if (ok) { SESSION.stats.right++; if (o.event === 'tier') SESSION.stats.mastered++; else if (['up', 'phrase', 'allph', 'grounded'].includes(o.event)) SESSION.stats.ups++; }
  else SESSION.stats.wrong++;
  const key = 't' + step.id + step.k + (step.g || '') + (step.p != null ? step.p : '');
  if (!ok && !step.retry && !SESSION.requeued[key]) { SESSION.requeued[key] = true; SESSION.steps.push(Object.assign({}, step, { retry: true })); F.requeuedNow = key; }
}
function wholeCheck(input, tr) { return tr.ph.map(p => p.a.some(a => coverage(input, a, p.ord) && precWords(a).every(w => hasWord(input, w)))); }

/* ---------- "How learning works" (More screen + once in the first session after the update) ---------- */
function learnHowHTML() {
  return '<ul class="plan learn">' +
    '<li><b>🔍 See it first.</b> Anything that changes the shape of data (joins, GROUP BY, window functions, UNION, DISTINCT, WHERE vs HAVING, ORDER BY/LIMIT, CTEs, cleaning, dedupe, delete-then-insert) starts with pictures: the input tables, the query, and the result table, with kept rows ✓, rows with no match ◐ (their NULLs shown), dropped rows ✕ and duplicates 2×. You can run each query for real. Then visual questions (tap the rows that survive, predict the row count, explain a NULL, run it yourself), and only then the theory, building blocks and definition phrases. Terms of an illustrated lesson start after you have seen its pictures. If you read a lesson before pictures existed, one lesson\'s pictures are added per day.</li>' +
    '<li><b>🖼 Every abstract idea, from several angles.</b> Not just SQL: entities and relationships, pipelines, orchestration, cloud and data modelling are each shown as pictures (tables, diagrams, timelines, arrows) from more than one angle before any definition. Example: before joins you see why data is split, what an entity, state, event and relationship are, and an ERD of what can join to what.</li>' +
    '<li><b>🏗 Inside a table before between tables.</b> Before relationships and joins you learn what a table is made of (name, columns, rows, cells, data types, primary and foreign keys, the schema), what one row stands for (the grain), how to decide which table a column belongs in (what does the fact describe? does it exist only because something happened?), and why the ID goes on the many side. Every practice table has a blueprint card.</li>' +
    '<li><b>🌍 Transfer test.</b> Understanding is checked on data you have never seen, not only the music tables: a shop (carts, orders, order items), a hospital, a school and a bank. Most of the questions are outside music, and every wrong option is explained.</li>' +
    '<li><b>🧱 Building blocks first.</b> Words like row, column, result rows, expression and condition are learned once with a real mini table, query and output (tap the actual thing). A term\'s definition starts only after its building blocks are grounded (right on 2 different days).</li>' +
    '<li><b>🧩 One phrase at a time.</b> Each definition is split into short phrases. The next phrase starts only after the current one is fully mastered.</li>' +
    '<li><b>✋ Pick → ⌨️ Type → 🔎 Spot.</b> A phrase is mastered when you have: picked it from options, typed it without options, and spotted it in a real query, table or scenario, each right on a <b>different day</b>. A term moves at most one step a day. A miss drops one step. After all phrases, you write the whole definition on another day.</li>' +
    '<li><b>✍️ Accepted wordings.</b> Each phrase has up to 3 correct ways of saying it; any one counts. Small typos in long words are fine.</li>' +
    '<li><b>🎯 Precision words.</b> Small words change meaning: each / one / every / all, by / on, one or more / one, before / after, TRUE / FALSE. Wrong options use exactly these near-misses, with a short reason. When typing, changing one of these words counts as wrong.</li>' +
    '<li><b>🪜 Tiers.</b> Tier 1 is the simplest professional wording (how a junior would say it in an interview). After mastery it becomes a flashcard, and 7 days later tier 2 (intermediate) unlocks, then tier 3 (advanced) where it makes sense.</li>' +
    '<li><b>👯 2–3 terms at once.</b> Two terms run in parallel, each at its own slow pace; a third joins when your recent term answers are very accurate. Not so basic that you misunderstand, not so simple that it gets boring.</li>' +
    '<li><b>⏱ Session split.</b> About 1/3 terminology and 2/3 code and problems, by item count: a short term block first, then code practice and problems, then a quick term review at the end. Terms never take time away from code.</li>' +
    '<li><b>⚡ Fast lane (only with consistent accuracy).</b> When your term answers are 90%+ correct on each of 4 study days in a row (days with at least 5 term answers count; days off neither count nor break the run), up to 5 terms run at once and 2 new terms can start a day. Every term still needs its building blocks and pick, type and spot on different days. It turns off at once if a day drops below 90% or your recent answers fall below 85%, and you are back to 2–3 terms, 1 new a day; extra terms pause with all their progress kept. Terms still take about 1/3 of the session: more terms just take turns.</li>' +
    '<li><b>🐢 Automatic pacing.</b> If you miss many recent term answers (over 35% of the last 20), no new term starts and weak phrases get extra review. Code practice is never slowed down.</li>' +
    '<li><b>🧭 Placement test.</b> Real SQL, output prediction and scenario questions place you at a level and unlock lessons up to it. Tested-out items are still scheduled for review. It only ever unlocks.</li>' +
    '<li><b>☁️ AWS track and memory hooks.</b> The AWS track runs in its own session. Each AWS term opens with a memory hook before its definition (a documented name origin, or a labelled memory aid), and you can write your own. Hooks are an extra layer: every AWS term still goes through pick → type → spot, flashcards and spaced reviews. A short name drill (see the job, name the service) has its own schedule and never skips or shortens a term\'s reviews. Console click-throughs are practice drawings, not real AWS screenshots.</li>' +
    '<li><b>⏩ Faster unlock (AWS Course 4 Module 1 only).</b> After you finish a lesson in this module, an optional button, Unlock next lesson now, opens the next lesson of the module straight away instead of waiting for a later session. It is off unless you tap it. ' + UNLOCK_NOTE + ' It never moves a flashcard, term or name-drill date, and it does not change the fast lane, your SQL lessons, streak, XP or percentages.</li>' +
    '<li><b>🪜 One change per step (v10).</b> Each picture changes one thing from the step before and starts by linking to what that step showed. You do it by hand first (tap rows, count) before you predict, and the rule is named only after you have shown the idea yourself. Every step reads question → fact → result.</li>' +
    '<li><b>✏️ Every mark has a reason.</b> Each ✓, ◐, ✕, 2× and ＋ in a table has a short line under it saying why that row was kept, unmatched, dropped, duplicated or added. The legend shows only the marks used, and the tables are open by default; nothing you need is hidden behind a toggle.</li>' +
    '<li><b>↩️ A miss goes one step back.</b> If you miss a question, you get a simpler question on a fresh example first, then the same question again.</li>' +
    '<li><b>🧩 Ideas in combination.</b> After single ideas come drills that combine them (join + filter + group), then a real task you plan before you write: the grain, the tables, the filter and how to test it. These application questions come back for short spaced reviews.</li>' +
    '<li><b>🔒 Progress is never reset.</b> Updates keep your streak, XP, levels, flashcards and term progress. Earlier term progress keeps its credit: you only add the missing steps.</li></ul>';
}
function viewLearn() {
  return '<header class="top"><button class="back" data-act="go" data-to="settings">‹ More</button><h1>How learning works</h1></header><main><section class="card">' + learnHowHTML() + '</section></main>' + nav('settings');
}
function viewHelpStep() {
  return '<div class="kicker">📖 New: how terms are learned</div><h2>How learning works now</h2>' + learnHowHTML() +
    '<p class="muted small">You can read this again anytime: More → How learning works.</p><div class="actions"><button class="btn primary big" data-act="helpDone" data-autofocus>Got it, start</button></div>';
}

/* ---------- AWS track extras (v9): memory hooks, name-recall drill, console click-throughs ----------
   All three are ADDED layers. They never replace or shorten the normal term path: every AWS term still runs
   pick → type → spot per phrase, tiers, flashcards and SM-2 reviews in deLearn.terms. The name drill keeps its
   own interval in deLearn.aws (a new, additive key) and never writes term state, never logs to the fast lane. */
const AWS_KEY = 'deLearn.aws';
function defaultAws() { return { v: 1, hooks: {}, nr: {}, ct: {} }; }
function loadAws() {
  const d = defaultAws(); let raw = null; try { raw = localStorage.getItem(AWS_KEY); } catch (e) {}
  if (!raw) return d;
  try { const o = JSON.parse(raw); const r = Object.assign(d, o); ['hooks', 'nr', 'ct'].forEach(k => { if (!r[k] || typeof r[k] !== 'object') r[k] = {}; }); return r; } catch (e) { return d; }
}
function saveAws() { try { localStorage.setItem(AWS_KEY, JSON.stringify(A)); } catch (e) {} }
let A = loadAws();
const HOOK_KIND = { origin: '📜 Where the name comes from (fact)', image: '🖼 Memory aid: a picture', split: '✂️ Memory aid: split the name', contrast: '⚖️ Memory aid: tell look-alikes apart' };
function hookHTML(id, mode) {
  const h = AWS_HOOKS[id]; if (!h) return ''; const own = A.hooks[id];
  return '<div class="aw-hook' + (mode === 'hint' ? ' hint' : '') + '"><div class="aw-lab">🪝 ' + (mode === 'hint' ? 'Hint: your memory hook' : 'Memory hook, before the definition') + ' · ' + HOOK_KIND[h.k] + '</div><p>' + h.t + '</p>' +
    (own ? '<p class="aw-own"><b>Your hook:</b> ' + esc(own) + '</p>' : '') +
    (mode === 'hint' ? '' : '<details class="aw-ownbox"><summary>✍️ Use my own hook</summary><input type="text" data-hook="' + id + '" maxlength="200" value="' + esc(own || '') + '" placeholder="A picture or phrase that works for you" autocomplete="off"><button class="btn ghost" data-act="awsHook" data-id="' + id + '">Save my hook</button><div class="muted small">Saved on this device. It is shown next to ours; the flashcards and reviews do not change.</div></details>') + '</div>';
}
// ---- name-recall drill: show the job, produce the AWS name (pick first, then type) ----
function nrDue(id) { const r = A.nr[id]; return !r || r.due <= today(); }
function nrCandidates() {
  return Object.keys(AWS_HOOKS).filter(id => ITEMS[id] && T.terms[id] && T.terms[id].ph.some(p => p.seen) && nrDue(id));
}
function initNR(step) {
  const r = A.nr[step.id] || { s: 0, ivl: 0, n: 0, ok: 0 }; const it = ITEMS[step.id];
  const f = { nr: true, id: step.id, form: r.s >= 1 ? 'type' : 'pick', checked: false, vals: [], t0: Date.now() };
  if (f.form === 'pick') { const same = Object.keys(AWS_HOOKS).filter(k => k !== step.id && ITEMS[k] && ITEMS[k].front !== it.front);
    const mod = same.filter(k => ITEMS[k].lesson === it.lesson); const pool = shuffle(mod).concat(shuffle(same.filter(k => !mod.includes(k))));
    f.opts = shuffle([{ x: it.front, i: 0 }].concat(pool.slice(0, 3).map((k, i) => ({ x: ITEMS[k].front, i: i + 1, why: 'That is: ' + AWS_HOOKS[k].j + '.' })))); }
  return f;
}
function nrAnswer(ok) {
  const f = F; const r = A.nr[f.id] || { s: 0, ivl: 0, n: 0, ok: 0 }; const secs = (Date.now() - f.t0) / 1000;
  r.n++; if (ok) { r.ok++; if (f.form === 'pick') { r.s = 1; r.ivl = 1; } else { const fast = secs < 8; r.ivl = r.s >= 2 ? Math.min(60, Math.max(2, r.ivl * (fast ? 3 : 2))) : 2; r.s = 2; f.fast = fast; } }
  else { r.s = 0; r.ivl = 1; }
  r.due = addDays(today(), r.ivl); A.nr[f.id] = r; saveAws();
  f.checked = true; f.ok = ok; f.next = r.due; if (ok) { SESSION.stats.right++; addXP(2); } else SESSION.stats.wrong++;
}
function viewNR(step) {
  if (!F || F.stepIndex !== SESSION.i) { F = initNR(step); F.stepIndex = SESSION.i; }
  const f = F, it = ITEMS[step.id], h = AWS_HOOKS[step.id];
  let s = '<div class="kicker">🏷 Name recall · AWS · extra drill (your flashcards and reviews still run as usual)</div><div class="muted small">' + (f.form === 'pick' ? 'PICK: choose the name' : 'TYPE: write the name (no options)') + '</div>' +
    '<h2 class="q">Which AWS name does this job?</h2><p class="def model">' + esc(h.j) + '</p>';
  if (f.form === 'pick') { f.html = false; s += optsHTML(f, 'nrPick'); }
  else s += '<div class="inputs"><label class="inp ' + (f.checked ? (f.ok ? 'ok' : 'bad') : '') + '"><span>?</span><input type="text" data-i="0" value="' + esc(f.vals[0] || '') + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (f.checked ? ' disabled' : ' data-autofocus') + '></label></div>';
  if (!f.checked) s += '<div class="actions">' + (f.form === 'type' ? '<button class="btn primary big" data-act="nrCheck">Check</button>' : '') + '<button class="btn ghost" data-act="nrIdk">I don\'t know: show me</button></div>';
  else {
    s += '<div class="feedback ' + (f.ok ? 'good' : 'badfb') + '">' + (f.ok ? '✅ ' + esc(it.front) + (f.fast ? ' (quick recall: next drill a little later)' : '') : '↩️ It is <b>' + esc(it.front) + '</b>.') + '</div>';
    if (f.pickWhy) s += '<div class="hintbox">💡 ' + esc(f.pickWhy) + '</div>';
    if (!f.ok) s += hookHTML(step.id, 'hint');
    s += '<div class="muted small">Next name drill: ' + esc(f.next) + '. This drill does not move the term\'s flashcard or review schedule.</div><div class="actions"><button class="btn primary big" data-act="next" data-autofocus>Continue</button></div>';
  }
  return s;
}
function nrMatch(input, name) {
  const n = x => norm(x).replace(/^(amazon|aws)\s+/, '').replace(/\s+/g, ' ').trim(); const a = n(input), b = n(name);
  if (!a) return false; if (a === b) return true; const short = b.replace(/\s*\(.*\)$/, ''); return a === short || (b.length > 6 && lev(a, b) <= 1);
}
function lev(a, b) { const m = a.length, n = b.length; let p = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
// ---- console click-throughs ----
function ctOpen() { return AWS_CT.filter(c => S.theory[c.after]); }
function initCT(step) { return { ct: true, c: AWS_CT.find(x => x.id === step.id), k: 0, miss: 0, picked: null }; }
function viewCT(step) {
  if (!F || F.stepIndex !== SESSION.i) { F = initCT(step); F.stepIndex = SESSION.i; }
  const f = F, c = f.c;
  if (f.k >= c.steps.length) return '<div class="kicker">🖱 Click-through · ' + esc(c.title) + '</div><h2>Done: ' + c.steps.length + ' steps</h2><div class="feedback ' + (f.miss ? 'meh' : 'good') + '">' + (f.miss ? f.miss + ' wrong first tries. Run it again from the AWS screen any time.' : '✅ Every step right first time.') + '</div><div class="actions"><button class="btn primary big" data-act="next" data-autofocus>Continue</button></div>';
  const st = c.steps[f.k];
  if (!f.order || f.order.k !== f.k) f.order = { k: f.k, o: shuffle(st.o.map((x, i) => i)) };
  let s = '<div class="kicker">🖱 Click-through · ' + esc(c.title) + ' · step ' + (f.k + 1) + '/' + c.steps.length + ' · <span class="muted">Coursera: ' + esc(c.cz) + '</span></div>' + ctScreenHTML(st.scr) + '<h3 class="q">' + esc(st.q) + '</h3>';
  s += '<div class="opts">' + f.order.o.map(i => '<button class="opt' + (f.picked != null ? (i === 0 ? ' ok' : i === f.picked ? ' bad' : '') : '') + '" data-act="ctPick" data-i="' + i + '"' + (f.picked != null ? ' disabled' : '') + '>' + esc(st.o[i]) + '</button>').join('') + '</div>';
  if (f.picked != null) s += (f.picked ? '<div class="hintbox">✗ ' + esc(st.w[f.picked]) + '</div>' : '') + '<div class="hintbox">💡 ' + esc(st.why) + '</div><div class="actions"><button class="btn primary big" data-act="ctNext" data-autofocus>Next step</button></div>';
  return s;
}
// add to an AWS session: up to 3 name drills (before the problems) and one open click-through (at the end)
function awsExtras(p) {
  const nr = shuffle(nrCandidates()).slice(0, 3).map(id => ({ type: 'nr', id }));
  let k = p.steps.length; while (k > 0 && p.steps[k - 1].type === 'problem') k--; p.steps.splice(k, 0, ...nr);
  const ct = ctOpen().find(c => !A.ct[c.id]); if (ct) p.steps.push({ type: 'ct', id: ct.id });
  return p;
}

/* ---------- v9.1: opt-in faster unlock, AWS Course 4 Module 1 only ----------
   Off unless tapped. Tapping writes only deLearn.aws (A.unl[lessonId] = date) and opens the next C4M1 lesson.
   It never moves a flashcard, term, name-drill or review date; the fast lane, SQL session, streak, XP and % are untouched. */
const UNLOCK_NOTE = 'Your spaced review still runs on its normal schedule, and this button only exists so you can keep pace with your Coursera deadlines.';
function c4m1Finished(l) { return !!(l && S.theory[l.id] && codeIds(l).every(id => S.items[id])); }
function c4m1NextAfter(lid) {
  const i = AWS_C4M1.findIndex(l => l.id === lid); if (i < 0 || !c4m1Finished(AWS_C4M1[i])) return null;
  const n = AWS_C4M1[i + 1]; return n && !c4m1Finished(n) ? n : null;
}
function unlockBtnHTML(lid) {
  const n = c4m1NextAfter(lid); if (!n) return '';
  const done = A.unl && A.unl[n.id];
  return '<section class="card aw-unlock"><div class="aw-lab">⏩ Faster unlock · Course 4 Module 1 only</div>' +
    '<button class="btn primary big" data-act="awsUnlock" data-l="' + n.id + '" data-from="' + lid + '">' + (done ? 'Open next lesson: ' : 'Unlock next lesson now: ') + esc(n.title) + '</button>' +
    '<p class="small muted">' + UNLOCK_NOTE + '</p></section>';
}
function awsUnlock(nid, from) {
  if (!c4m1NextAfter(from) || c4m1NextAfter(from).id !== nid) return false;
  if (!A.unl || typeof A.unl !== 'object') A.unl = {};
  if (!A.unl[nid]) { A.unl[nid] = today(); saveAws(); }
  return true;
}

/* ============================ ACTIONS ============================ */
const ACT = {
  go: el => go(el.dataset.to, el.dataset.l ? { l: el.dataset.l } : {}),
  startDaily: () => { const p = buildDailySession(); if (p.steps.length) { commitTermPlan(p.terms); startSession(p); } },
  startLesson: el => startSession(buildLessonSession(el.dataset.l)),
  awsUnlock: el => { if (awsUnlock(el.dataset.l, el.dataset.from)) startSession(buildLessonSession(el.dataset.l)); },
  startAws: () => { const p = buildAwsSession(true); if (p.steps.length) { commitTermPlan(p.terms); startSession(p); } },
  startCards: () => { const p = buildCardSession(); if (p.steps.length) startSession(p); },
  quit: () => { if (confirm('End the session now? Everything you answered is already saved.')) { SESSION.stats.quit = true; endSession(); } },
  next: () => nextStep(),
  awsHook: el => { const id = el.dataset.id; const inp = app().querySelector('[data-hook="' + id + '"]'); const v = inp ? inp.value.trim() : ''; if (v) A.hooks[id] = v; else delete A.hooks[id]; saveAws(); toast(v ? 'Your hook is saved' : 'Your hook is removed'); render(); },
  nrPick: el => { if (F.checked) return; const o = F.opts[+el.dataset.i]; F.pick = +el.dataset.i; if (o.i) F.pickWhy = o.why; nrAnswer(o.i === 0); render(); },
  nrCheck: () => { if (F.checked) return; collectInputs(); if (!(F.vals[0] || '').trim()) { toast('Type the name first (or tap I don\'t know)'); return; } nrAnswer(nrMatch(F.vals[0], ITEMS[F.id].front)); render(); },
  nrIdk: () => { if (F.checked) return; nrAnswer(false); render(); },
  ctPick: el => { if (F.picked != null) return; F.picked = +el.dataset.i; if (F.picked) F.miss++; render(); },
  ctNext: () => { F.k++; F.picked = null; if (F.k >= F.c.steps.length) { const r = A.ct[F.c.id] || { n: 0 }; r.done = today(); r.n++; r.miss = F.miss; A.ct[F.c.id] = r; saveAws(); addXP(F.miss ? 5 : 10); } render(); window.scrollTo(0, 0); },
  startCt: el => startSession({ steps: [{ type: 'ct', id: el.dataset.id }], mode: 'aws' }),
  /* v6 illustration steps */
  illNext: () => { const st = SESSION.steps[SESSION.i]; const L = ILLUS[st.lesson]; if (L.order ? st.last : st.sc + 1 >= L.scenes.length) { const vs = visState(st.lesson); if (!vs.seen) { vs.seen = today(); addXP(5); } if (L.order) { vs.v10 = vs.v10 || today(); vs.v101 = vs.v101 || today(); } saveTerms(); save(); } nextStep(); },
  illRun: async () => { const st = SESSION.steps[SESSION.i]; const sc = ILLUS[st.lesson].scenes[st.sc];
    try { F.run = tableHTML(await runIll(sc.sql, st.lesson, sc.ts), 20) + '<div class="muted small">Same rows as the drawing above (row order may differ: without ORDER BY it is not guaranteed).</div>'; } catch (e) { F.run = '<div class="ill-err">✕ ' + esc(e.message) + '</div><div class="muted small">That error is the point: the database refused the duplicate.</div>'; }
    render(); },
  vqTap: el => { if (F.done) return; const i = +el.dataset.r; const k = F.sel.indexOf(i); if (k >= 0) F.sel.splice(k, 1); else F.sel.push(i); render(); },
  vqTapC: el => { if (F.done) return; F.sel = [+el.dataset.c]; render(); },
  vqCls: el => { if (F.done) return; F.vals[+el.dataset.i] = +el.dataset.c; render(); },
  vqLine: el => { if (F.done) return; F.pick = +el.dataset.k; render(); },
  vqPick: el => { if (F.done) return; F.pick = +el.dataset.k; finishVQ(F.opts[F.pick].i === 0); render(); },
  vqRun: async () => { const st = SESSION.steps[SESSION.i]; F.code = document.getElementById('vqCode').value;
    try { F.out = tableHTML(await runIll(F.code, st.lesson, F.q.ts), 20); } catch (e) { F.out = '<div class="bad small">SQL error: ' + esc(e.message) + '</div>'; } render(); },
  vqCheck: async () => {
    const st = SESSION.steps[SESSION.i]; const q = F.q;
    if (q.k === 'line') { if (F.pick == null) { toast('Tap the line you think is wrong'); return; } finishVQ(F.pick === q.ans); render(); return; }
    if (q.k === 'tapc') { if (!F.sel.length) { toast('Tap a column header'); return; } finishVQ(F.sel[0] === q.ans[0]); render(); return; }
    if (q.k === 'cls') { if (F.vals.some(v => v == null)) { toast('Sort every item first'); return; } const bad = q.items.filter((it, i) => F.vals[i] !== it[1]).length; finishVQ(!bad, bad ? bad + ' of ' + q.items.length + ' in the wrong group.' : ''); render(); return; }
    if (q.k === 'tap') { if (!F.sel.length) { toast('Tap at least one row'); return; } const ok = F.sel.length === q.ans.length && q.ans.every(i => F.sel.includes(i)); finishVQ(ok); render(); return; }
    F.code = document.getElementById('vqCode').value; if (/____/.test(F.code)) { toast('Fill in the ____ blanks first'); return; }
    try {
      const u = await runIll(F.code, st.lesson, q.ts), e = await runIll(q.sol, st.lesson, q.ts); F.out = tableHTML(u, 20);
      const c = compareResults(u, e, false); const bad = q.forbid && new RegExp(q.forbid, 'i').test(F.code);
      finishVQ(c.ok && !bad, bad ? 'Right rows, but this question asks you to do it without that keyword.' : c.ok ? '' : c.msg);
    } catch (err) { F.out = '<div class="bad small">SQL error: ' + esc(err.message) + '</div>'; finishVQ(false, 'The query has an error.'); }
    render();
  },
  vqIdk: () => { if (F.q.k === 'tap' || F.q.k === 'tapc') F.sel = F.q.ans.slice(); if (F.q.k === 'cls') F.vals = F.q.items.map(it => it[1]); if (F.q.k === 'mc') F.pick = -1; if (F.q.k === 'line') F.pick = -1; finishVQ(false); render(); },
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
  exportJSON: () => { download('de-daily-backup-' + today() + '.json', JSON.stringify(Object.assign({}, S, { _ext: E, _terms: T }), null, 1), 'application/json'); toast('Backup downloaded'); },
  importPaste: () => importData(document.getElementById('importText').value),
  anki: el => { const r = buildAnki(el.dataset.all === '1'); if (!r.n) { toast('Your deck is empty. Try "Export all items".'); return; } download('de-daily-anki-' + today() + '.txt', r.text, 'text/plain'); toast(r.n + ' cards exported'); },
  biteIntro: () => { const id = F.id; if (!S.items[id]) itemState(id); ensureBite(id); const pd = paceDay(); pd.terms++; addXP(2); save(); nextStep(); },
  bitePick: el => { if (F.checked) return; F.pick = +el.dataset.i; const ok = F.options[F.pick] === F.answer; F.res = [ok]; finishBite(ok); render(); },
  checkBite: () => {
    const it = ITEMS[F.id]; collectInputs();
    if (F.mode === 'full') { F.score = recallScore(F.vals[0] || '', it); F.checked = true; render(); return; }
    if (F.mode === 'atype') { const r = F.asp.t.map(a => checkBlank(F.vals[0] || '', [a], false)).find(Boolean); if (r === 'close') F.close = true; F.res = [!!r]; finishBite(!!r); render(); return; }
    F.res = F.blanks.map((p, i) => { const r = checkPiece(F.vals[i] || '', it.bite.pieces[p], it.bite.keys[p]); if (r === 'close') F.close = true; return !!r; });
    finishBite(F.res.every(Boolean)); render();
  },
  biteDontKnow: () => { collectInputs(); F.res = (F.blanks || [0]).map(() => false); if (F.mode === 'full') { F.score = recallScore('', ITEMS[F.id]); F.graded = true; } finishBite(false); render(); },
  biteSelf: el => { F.graded = true; finishBite(el.dataset.ok === '1'); render(); },
  biteOverride: () => {
    const step = SESSION.steps[SESSION.i]; const sn = JSON.parse(F.snap);
    E.bites[step.id] = sn.b; if (sn.it) S.items[step.id] = sn.it; if (sn.c) S.cards[step.id] = sn.c; else delete S.cards[step.id];
    E.pace.log.pop(); SESSION.stats.wrong--;
    if (F.requeuedNow) { const k = SESSION.steps.findIndex((s, j) => j > SESSION.i && s.id === step.id && s.retry && s.type === 'bite'); if (k > 0) SESSION.steps.splice(k, 1); SESSION.requeued[F.requeuedNow] = false; }
    F.overridden = true; F.res = F.res.map(() => true); finishBite(true); render();
  },
  tPick: el => {
    if (F.checked) return; F.pick = +el.dataset.i; const o = F.opts[F.pick]; const ok = o.i === 0;
    if (!ok && F.form === 'prec') { const sw = PREC_SWAP.find(x => norm(x[0]) === norm(F.pd.word) && norm(x[1]) === norm(o.x)); F.pickWhy = sw ? sw[2] : 'The exact word here is "' + F.pd.word + '"; "' + o.x + '" changes the meaning.'; }
    else if (!ok && o.why) F.pickWhy = o.why;
    finishTerm(ok); render();
  },
  tTap: el => { if (F.checked) return; F.pick = +el.dataset.i; finishTerm(F.q.tap[F.pick][1] === 1); render(); },
  tCheck: () => {
    collectInputs();
    if (F.form === 'whole') { if (!(F.vals[0] || '').trim()) { toast('Write the definition first (or tap I don\'t know)'); return; } F.wres = wholeCheck(F.vals[0] || '', F.tr); F.checked = true; render(); return; }
    const r = checkPhrase(F.vals[0] || '', F.ph); if (!r.ok && r.prec) F.precFail = r.prec; finishTerm(r.ok); render();
  },
  tIdk: () => { collectInputs(); if (F.form === 'whole') { F.wres = F.tr.ph.map(() => false); F.graded = true; } F.pick = -1; finishTerm(false); render(); },
  tSelf: el => { F.graded = true; finishTerm(el.dataset.ok === '1'); render(); },
  tOverride: () => {
    const step = SESSION.steps[SESSION.i]; const sn = JSON.parse(F.snap);
    if (sn.ts) T.terms[step.id] = sn.ts; T.log.length = sn.log; fastState(); if (sn.dd) T.daily[today()] = sn.dd; else delete T.daily[today()]; if (sn.fast) T.fast = sn.fast; SESSION.stats.wrong--;
    if (F.requeuedNow) { const k = SESSION.steps.findIndex((x, j) => j > SESSION.i && x.retry && x.type === 'term' && x.id === step.id); if (k > 0) SESSION.steps.splice(k, 1); SESSION.requeued[F.requeuedNow] = false; }
    F.overridden = true; F.precFail = null; finishTerm(true); render();
  },
  helpDone: () => { T.helpSeen = today(); saveTerms(); nextStep(); },
  goPlacement: () => { UI.pt = ptNew(); go('placement'); },
  startFresh: () => { E.onboarded = today(); save(); render(); },
  ptStart: () => { ptNext(); render(); window.scrollTo(0, 0); },
  ptQuit: () => { if (UI.pt.phase !== 'q' || confirm('Leave the placement test? Nothing has changed yet.')) { UI.pt = null; go('home'); } },
  ptRun: async () => { const c = UI.pt.cur; c.val = document.getElementById('ptCode').value; try { c.out = tableHTML(await runSQL(c.val, null, 'music'), 30); } catch (e) { c.out = '<div class="bad small">SQL error: ' + esc(e.message) + '</div>'; } render(); },
  ptSubmit: async () => {
    const c = UI.pt.cur, q = c.q; if (c.checked) return;
    if (q.kind === 'sql') {
      c.val = document.getElementById('ptCode').value; if (!c.val.trim()) { toast('Write a query first (or tap I don\'t know)'); return; }
      try { const [u, e] = [await runSQL(c.val, null, 'music'), await runSQL(q.sol, null, 'music')]; c.out = tableHTML(u, 30); const r = compareResults(u, e, !!q.ordered); c.msg = r.ok ? '' : r.msg; ptAnswer(r.ok); }
      catch (err) { c.out = '<div class="bad small">SQL error: ' + esc(err.message) + '</div>'; c.msg = 'the query has an error'; ptAnswer(false); }
    } else { const el = document.getElementById('ptVal'); c.val = el ? el.value : ''; if (!c.val.trim()) { toast('Type your answer (or tap I don\'t know)'); return; } ptAnswer(q.a.some(a => norm(a) === norm(c.val))); }
    render();
  },
  ptPick: el => { const c = UI.pt.cur; if (c.checked) return; c.pick = +el.dataset.i; ptAnswer(c.opts[c.pick] === c.q.o[0]); render(); },
  ptIdk: () => { const c = UI.pt.cur; if (c.checked) return; const el = document.getElementById('ptCode') || document.getElementById('ptVal'); if (el) c.val = el.value; c.msg = 'counted as a miss, no other penalty'; ptAnswer(false); render(); },
  ptContinue: () => { ptContinue(); render(); window.scrollTo(0, 0); },
  ptDone: () => { UI.pt = null; go('home'); },
  reset: () => { if (confirm('Delete ALL progress (XP, streak, levels, cards)? Export a backup first if unsure.')) { S = defaultState(); E = defaultExt(); T = defaultTerms(); save(); toast('Progress reset'); go('home'); } }
};
function collectInputs() { app().querySelectorAll('[data-i]').forEach(el => { if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') F.vals[+el.dataset.i] = el.value; }); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => { if (F && e.target.dataset && e.target.dataset.i != null && UI.screen === 'session') F.vals[+e.target.dataset.i] = e.target.value; });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && UI.screen === 'placement' && e.target.id === 'ptVal') { e.preventDefault(); ACT.ptSubmit(); return; }
  if (e.key !== 'Enter' || UI.screen !== 'session' || !F) return;
  if (e.target.tagName === 'INPUT') {
    e.preventDefault();
    const ins = [...app().querySelectorAll('.inputs input')]; const k = ins.indexOf(e.target);
    if (k >= 0 && k < ins.length - 1) ins[k + 1].focus(); else if (!F.checked) (F.term ? ACT.tCheck() : F.bite ? ACT.checkBite() : ACT.checkFade());
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'importFile' && e.target.files[0]) { const r = new FileReader(); r.onload = () => importData(r.result); r.readAsText(e.target.files[0]); }
});

/* ============================ INIT ============================ */
// v3 state lives in deLearn.ext, v4 term state in deLearn.terms; deLearn.v1 records are kept as they are
backupV9(); S = loadState(); E = loadExt(); migrateExt(); T = loadTerms(); migrateTerms(); save(); initFloor10();
// v10 stable question IDs: copy position-keyed answers once (in memory; written with the next save; vs.q itself is kept)
if (!T.visMig) { Object.keys(T.vis || {}).forEach(lid => { if (ILLUS[lid]) visMigrate(lid); }); }
try { history.replaceState({ screen: 'home', params: {} }, ''); } catch (e) {}
render();
if (/^https?:$/.test(location.protocol)) {
  const l = document.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.json'; document.head.appendChild(l);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
setTimeout(() => { getSQL().catch(() => {}); }, 400); // warm up the SQL engine

