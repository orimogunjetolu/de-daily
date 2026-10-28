
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
  ['artists', 'artist_id (PK), name, genre: 14 rows (Tems has a NULL genre)'],
  ['songs', 'song_id (PK), title, artist_id (FK → artists), duration_sec: 14 rows'],
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
{ id:'sqlr', title:'Entities, events & relationships', added:7,
  theory:{
    why:'Joins only make sense once you know <i>why</i> data is split into tables and <i>what</i> links them. If <code>songs.artist_id = artists.artist_id</code> looks like magic syntax, you will guess at joins. If you can see "a song belongs to an artist" and "a stream links a listener to a song", you know which table connects to which, and which pairs cannot be connected at all.',
    body:[
      'One big table repeats facts: the artist\'s name and label are copied onto every song. Change a label and you must update every copy, and if you miss one the data disagrees with itself. Mistype a name once ("Burna Boi") and you have invented a new artist. So we <b>split</b> the data so that each fact is stored <b>once</b>, in the table it describes.',
      '<b>Entity</b>: a thing that exists on its own and that we store facts about, such as an artist, a song or a listener. Each entity gets its own table and its own ID (the primary key).',
      '<b>State</b>: a current, changeable fact about an entity, such as an artist\'s current label or a song\'s chart position today. It is usually a column. An UPDATE overwrites it, so the old value is lost unless you keep history on purpose (a history table, or a slowly changing dimension later in the course).',
      '<b>Event</b>: something that happened at a moment, such as "Ada streamed Last Last at 21:14". It did not exist until it happened, and it never changes afterwards. Each event is a <b>new row</b> holding a timestamp and the IDs of the entities involved (listener_id, song_id).',
      '<b>Relationship</b>: how entities connect. Some relationships are fixed facts stored as a foreign key: a song belongs to an artist (<code>songs.artist_id → artists.artist_id</code>). Others are <b>created by events</b>: a listener and a song have no link until a stream happens, and the stream row <i>is</i> the link. Entities exist first. Events, and the links they create, come later.',
      'There are three kinds of relationship. <b>One-to-many</b>: an artist has many songs, and the foreign key sits on the "many" side. <b>One-to-one</b>: an artist has one profile. <b>Many-to-many</b>: listeners and songs, or songs and playlists. A many-to-many relationship needs a <b>linking (junction) table</b> that holds pairs of IDs. An <b>ERD</b> (entity-relationship diagram) draws the tables as boxes and the relationships as lines between their keys.',
      'Tables connect only through <b>shared IDs</b>. listeners and artists share no column, so you cannot join them directly. Instead you follow the arrows: listeners → streams → songs → artists. If no shared ID, event table or linking table connects two tables, a join between them has no meaning.'
    ],
    pro:'"I start from the ERD. Entities like artists and songs are linked by foreign keys. Events like streams are rows that carry the listener\'s and the song\'s IDs, so that is the path I join along."',
    q:{ q:'You need each listener\'s favourite artist, but listeners and artists share no column. Is it possible, and how?', a:'Yes, by following the relationships: listeners → streams (listener_id) → songs (song_id) → artists (artist_id). The stream events connect listeners to songs, and songs.artist_id connects songs to artists. Count streams per listener and artist, then keep the top one for each listener.' }
  },
  terms:[
    { id:'sqlr-t1', term:'Entity', def:'A [[thing]] that exists on its own and that we store facts about, with its own [[table]] and [[ID]].' },
    { id:'sqlr-t2', term:'State', def:'A [[current]], changeable fact about an entity, usually a column. An UPDATE [[overwrites]] the old value.' },
    { id:'sqlr-t3', term:'Event (data modelling)', def:'Something that [[happened]] at a moment. It is stored as a [[new row]] with a timestamp and the IDs involved, and is never changed.' },
    { id:'sqlr-t4', term:'Relationship', def:'How entities [[connect]]: either a fixed fact stored as a [[foreign key]], or a link [[created by events]].' },
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
      explain:'The listener–artist link is not stored anywhere. It exists only because of stream events plus the fixed song → artist foreign key. Ada → Rema shows 2 plays because she streamed Calm Down twice. Zainab is missing: she has no stream events, so she has no link to any artist.' }
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
    aspects:[{ q:'WHERE genre = NULL returns no rows, even though Tems has a NULL genre. Why?', o:['genre = NULL is UNKNOWN for every row, and WHERE keeps only TRUE rows','NULL rows are hidden by default','= only works on numbers','NULL must be written in quotes'], why:'Any comparison with NULL is UNKNOWN, never TRUE.' },
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
  { n:2, name:'Aggregation, relationships & JOINs', lessons:['sql4','sqlr','sql5','sqlm'] },
  { n:3, name:'Intermediate SQL', lessons:['sql6','sql7','sql8','sql9'] },
  { n:4, name:'ETL fundamentals', lessons:['etl1','etl2','etl3','etl4','etl5'] },
  { n:5, name:'Pipeline in practice (Project 1 concepts)', lessons:['pj1','pj2','pj3','pj4','pj5','pj6','pj7','pj8'] }
];
const TINY_GENRE = '<table class="mini"><tr><th>name</th><th>genre</th></tr><tr><td>A</td><td>Afrobeats</td></tr><tr><td>B</td><td>Hip-hop</td></tr><tr><td>C</td><td class="null">NULL</td></tr><tr><td>D</td><td>Afrobeats</td></tr></table>';
const PLACE_BANK = [
  // ---- Level 1
  { id:'p1a', lv:1, kind:'sql', q:'List the <b>title</b> of every song longer than 180 seconds, longest first.', sol:"SELECT title FROM songs WHERE duration_sec > 180 ORDER BY duration_sec DESC;", ordered:true },
  { id:'p1b', lv:1, kind:'predict', q:'Table <code>t</code>:' + TINY_GENRE + 'What number does this return?', code:"SELECT COUNT(*) FROM t WHERE genre <> 'Afrobeats';", a:['1'], why:'Only B. C has a NULL genre, and NULL <> \'Afrobeats\' is UNKNOWN, so WHERE drops it. Many people answer 2.' },
  { id:'p1c', lv:1, kind:'mcq', q:'A report query has no ORDER BY. The top song has "always" come first so far. Is that order guaranteed?', o:['No: without ORDER BY the row order is not guaranteed','Yes: rows come back in insertion order','Yes, if the table has a primary key','Only when LIMIT is used'], why:'A table is an unordered set. Order only exists when you ask for it.' },
  { id:'p1d', lv:1, kind:'sql', q:'Return the distinct <b>genre</b> values in <code>artists</code>, leaving out missing (NULL) genres.', sol:"SELECT DISTINCT genre FROM artists WHERE genre IS NOT NULL;" },
  // ---- Level 2
  { id:'p2a', lv:2, kind:'sql', q:'For each artist, return the <b>name</b> and <b>how many songs</b> they have in <code>songs</code>. Include artists with 0 songs.', sol:"SELECT a.name, COUNT(s.song_id) FROM artists a LEFT JOIN songs s ON s.artist_id = a.artist_id GROUP BY a.artist_id, a.name;" },
  { id:'p2b', lv:2, kind:'predict', q:'Column <code>x</code> in table <code>t</code> holds three rows: 1, NULL, 3.', code:'SELECT AVG(x) FROM t;', a:['2','2.0'], why:'AVG ignores NULL: (1 + 3) / 2 = 2. A common mistake is 4 / 3 = 1.33.' },
  { id:'p2c', lv:2, kind:'mcq', q:'You want only artists whose total streams exceed 200,000. Where does that condition go?', o:['HAVING SUM(streams) > 200000','WHERE SUM(streams) > 200000','WHERE streams > 200000','ORDER BY SUM(streams) > 200000'], why:'WHERE filters rows before grouping and cannot use aggregates; HAVING filters groups.' },
  { id:'p2d', lv:2, kind:'sql', q:'Return each <b>chart_date</b> with its <b>total streams</b> (one row per date).', sol:"SELECT chart_date, SUM(streams) FROM chart_entries GROUP BY chart_date;" },
  { id:'p2e', lv:2, kind:'mcq', q:'You join orders (one row per order) to order_items (many rows per order), then SUM(orders.shipping_fee). The total is far too high. Why?', o:['Fan-out: each order row is repeated once per item','SUM skips NULL values','You need SELECT DISTINCT','INNER JOIN drops rows'], why:'A one-to-many join multiplies the "one" side rows.' },
  { id:'p2f', lv:2, kind:'mcq', q:'<code>listeners</code> and <code>artists</code> share no column. <code>streams(listener_id, song_id)</code> and <code>songs(song_id, artist_id)</code> exist. How do you get each listener\'s artists?', o:['Join listeners → streams → songs → artists, following the foreign keys','Join listeners to artists on name','You cannot: there is no shared column','CROSS JOIN listeners and artists'], why:'Tables connect through shared IDs. The stream events link listeners to songs, and songs.artist_id links songs to artists.' },
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
  { id:'p4e', lv:4, kind:'mcq', q:'The API returned 3 rows today instead of ~100, on time and with the right columns. Which check catches this?', o:['Volume check (row count vs expected)','Freshness check','Schema drift check','A unit test of the transform'], why:'Fresh and well-formed, just too few rows: a volume problem.' },
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
const SC_SONGS = MT(['title', 'artist', 'streams'], [['Rush', 'Ayra Starr', 900], ['Calm Down', 'Rema', 1200], ['Essence', 'Wizkid', 700]]);
const SC_Q = "SELECT title, streams * 2 AS doubled\nFROM songs\nWHERE streams > 800\nORDER BY streams DESC;";
const SC_RES = MT(['title', 'doubled'], [['Calm Down', 2400], ['Rush', 1800]]);
const SC_ART = MT(['artist_id', 'name', 'genre'], [[1, 'Burna Boy', 'Afrobeats'], [2, 'Tems', null], [3, 'Rema', 'Afrobeats']]);
const SC_SNG = MT(['song_id', 'title', 'artist_id'], [[10, 'Last Last', 1], [11, 'Calm Down', 3], [12, 'Charm', 3]]);
const SC_CHART = MT(['chart_date', 'artist', 'title', 'streams'], [['10-16', 'Rema', 'Calm Down', 1200], ['10-17', 'Rema', 'Calm Down', 1100], ['10-17', 'Tems', 'Free Mind', 800]]);
const SCENE = '<div class="scene">' + LAB('Table <code>songs</code>', SC_SONGS) + LAB('Query', QY(SC_Q)) + LAB('Output (the result)', SC_RES) + '</div>';

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
const ILL_POS = ILT('chart', ['chart_date', 'title', 'position'], [['10-16', 'Calm Down', 1], ['10-17', 'Calm Down', 2], ['10-16', 'Rush', 2], ['10-17', 'Rush', 1], ['10-17', 'Essence', 3]]);
const ILLUS = {
  sql5: {
    tables: { artists: ILL_ART, songs: ILL_SNG },
    scenes: [
      { h: 'Two tables, and which one is LEFT', fig: 'lr',
        say: 'Before any definition, look at the data. <b>artists</b> has one row per artist. <b>songs</b> has one row per song, and <code>songs.artist_id</code> points at <code>artists.artist_id</code>.<br><b>Left or right?</b> It is only about the <b>order you write them</b>: the table after <code>FROM</code> (written first) is the <b>LEFT</b> table; the table after <code>JOIN</code> is the <b>RIGHT</b> table. It has nothing to do with size or keys.',
        sql: 'SELECT a.name, s.title, s.artist_id\nFROM artists a          -- LEFT (first)\nJOIN songs s             -- RIGHT (second)\n  ON s.artist_id = a.artist_id;', norun: true,
        ins: [{ t: 'artists', role: '⬅ LEFT table: written first, after FROM' }, { t: 'songs', role: 'RIGHT table ➡: written after JOIN' }],
        note: 'Matches: Burna Boy (1) ↔ Last Last, Tems (2) ↔ Free Mind. <b>Asake</b> (3) has no song. <b>Mystery Song</b> points at artist 9, who does not exist. Watch what each join does with these two.' },
      { h: 'INNER JOIN: only matches', fig: 'venn-inner', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'INNER JOIN keeps a row only when the two sides <b>match</b>. Asake and Mystery Song have no partner, so both disappear.',
        sql: ILL_JSEL + 'FROM artists a\nINNER JOIN songs s\n  ON s.artist_id = a.artist_id;',
        ins: [{ t: 'artists', m: ['m', 'm', 'x'], role: '⬅ LEFT (FROM)' }, { t: 'songs', m: ['m', 'm', 'x'], role: 'RIGHT (JOIN) ➡' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2]], m: ['m', 'm'] } },
      { h: 'LEFT JOIN: every left row stays', fig: 'venn-left', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'LEFT JOIN keeps <b>every row of the LEFT table</b> (artists). Asake has no song, so the right-side columns are filled with <b>NULL</b>. Mystery Song is still dropped: it is on the right side.',
        sql: ILL_JSEL + 'FROM artists a\nLEFT JOIN songs s\n  ON s.artist_id = a.artist_id;',
        ins: [{ t: 'artists', m: ['m', 'm', 'u'], role: '⬅ LEFT (FROM): all kept' }, { t: 'songs', m: ['m', 'm', 'x'], role: 'RIGHT (JOIN) ➡' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2], ['Asake', null, null]], m: ['m', 'm', 'u'] } },
      { h: 'RIGHT JOIN: every right row stays', fig: 'venn-right', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'Same written order, other side. RIGHT JOIN keeps <b>every row of the RIGHT table</b> (songs). Mystery Song has no artist 9, so <code>name</code> is <b>NULL</b>. Asake is dropped now.',
        sql: ILL_JSEL + 'FROM artists a\nRIGHT JOIN songs s\n  ON s.artist_id = a.artist_id;',
        ins: [{ t: 'artists', m: ['m', 'm', 'x'], role: '⬅ LEFT (FROM)' }, { t: 'songs', m: ['m', 'm', 'u'], role: 'RIGHT (JOIN) ➡: all kept' }],
        out: { c: ['name', 'title', 'artist_id'], r: [['Burna Boy', 'Last Last', 1], ['Tems', 'Free Mind', 2], [null, 'Mystery Song', 9]], m: ['m', 'm', 'u'] } },
      { h: 'FULL OUTER JOIN: everything from both', fig: 'venn-full', vl: ['Asake', '2 matches', 'Mystery Song'],
        say: 'FULL OUTER JOIN keeps <b>all rows from both tables</b>: the 2 matches, plus Asake (NULL song) and Mystery Song (NULL artist). 4 rows.',
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
      { k: 'mc', q: 'Which is the <b>LEFT</b> table here?', sql: 'SELECT a.name, s.title\nFROM songs s\nLEFT JOIN artists a ON a.artist_id = s.artist_id;', o: ['songs: it is written first, after FROM', 'artists: it holds the primary key', 'artists: it comes after JOIN', 'whichever table is bigger'], why: 'Left/right is only about written order: FROM songs → songs is LEFT; JOIN artists → artists is RIGHT.' },
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT a.name, s.title FROM artists a RIGHT JOIN songs s ON s.artist_id = a.artist_id;', o: ['3', '2', '4', '1'], why: 'Every song (right table) stays: 2 matches + Mystery Song with NULL name. Asake is dropped.' },
      { k: 'mc', q: 'Rewrite <code>FROM artists a RIGHT JOIN songs s ON …</code> as a LEFT JOIN.', o: ['FROM songs s LEFT JOIN artists a ON …', 'FROM artists a LEFT JOIN songs s ON …', 'FROM songs s RIGHT JOIN artists a ON …', 'It cannot be rewritten'], why: 'Swap the tables: the one you wanted to keep in full (songs) goes after FROM.' },
      { k: 'run', q: 'Run it: fill the blank so <b>Asake stays</b> (with a NULL title). Press ▶ Run to see the result, then ✓ Check.', code: 'SELECT a.name, s.title, s.artist_id\nFROM artists a\n____ JOIN songs s\n  ON s.artist_id = a.artist_id;', sol: 'SELECT a.name, s.title, s.artist_id FROM artists a LEFT JOIN songs s ON s.artist_id = a.artist_id;', why: 'LEFT JOIN keeps every row of the left table (artists). FULL would also add Mystery Song.' },
      { k: 'run', q: 'Run it: keep <b>every song</b>, even Mystery Song, <b>without</b> RIGHT JOIN.', code: 'SELECT a.name, s.title, s.artist_id\nFROM ____\nLEFT JOIN ____\n  ON a.artist_id = s.artist_id;', sol: 'SELECT a.name, s.title, s.artist_id FROM songs s LEFT JOIN artists a ON a.artist_id = s.artist_id;', forbid: 'right\\s+join|full', why: 'FROM songs s LEFT JOIN artists a: songs is written first, so it is the left table and every song is kept.' }
    ] },
  sql2: {
    tables: { songs: ILT('songs', ['title', 'artist', 'streams'], [['Rush', 'Ayra Starr', 900], ['Calm Down', 'Rema', 1200], ['Essence', 'Wizkid', 700], ['Free Mind', 'Tems', null]]) },
    scenes: [
      { h: 'WHERE keeps fewer rows', fig: 'flow', say: 'WHERE checks the condition on <b>each row</b>. Rows where it is TRUE stay; FALSE <b>and UNKNOWN</b> rows are dropped. The columns do not change, only the number of rows.',
        sql: 'SELECT title, streams\nFROM songs\nWHERE streams > 800;', ins: [{ t: 'songs', m: ['m', 'm', 'x', 'x'] }],
        out: { c: ['title', 'streams'], r: [['Rush', 900], ['Calm Down', 1200]], m: ['m', 'm'] },
        note: 'Free Mind has NULL streams. <code>NULL &gt; 800</code> is UNKNOWN, not TRUE, so it is dropped too.' },
      { h: 'Finding the missing values', fig: 'flow', say: 'To keep rows with a missing value you must ask <code>IS NULL</code>. <code>= NULL</code> is never TRUE.',
        sql: 'SELECT title, streams\nFROM songs\nWHERE streams IS NULL;', ins: [{ t: 'songs', m: ['x', 'x', 'x', 'm'] }],
        out: { c: ['title', 'streams'], r: [['Free Mind', null]], m: ['m'] } }
    ],
    qs: [
      { k: 'tap', q: 'Tap the rows kept by <code>WHERE streams &lt; 1000</code>.', t: 'songs', ans: [0, 2], why: 'Rush (900) and Essence (700). Free Mind\'s NULL makes the test UNKNOWN, so it is dropped.' },
      { k: 'mc', q: 'How many rows does this return?', sql: "SELECT title FROM songs WHERE streams <> 900;", o: ['2', '3', '4', '1'], why: 'Calm Down and Essence. Rush is 900, and NULL <> 900 is UNKNOWN, so Free Mind is dropped.' }
    ] },
  sql3: {
    tables: { chart: ILT('chart', ['title', 'artist', 'streams'], [['Rush', 'Ayra Starr', 900], ['Calm Down', 'Rema', 1200], ['Essence', 'Wizkid', 700], ['Charm', 'Rema', 500]]) },
    scenes: [
      { h: 'ORDER BY + LIMIT: sort, then cut', fig: 'flow', say: 'ORDER BY rearranges the <b>result rows</b>; LIMIT then keeps the first n. Together they answer "top 2".',
        sql: 'SELECT title, streams\nFROM chart\nORDER BY streams DESC\nLIMIT 2;', ins: [{ t: 'chart', m: ['m', 'm', 'x', 'x'] }],
        out: { c: ['title', 'streams'], r: [['Calm Down', 1200], ['Rush', 900]], m: ['m', 'm'], ordered: true }, lg: { m: '✓ in the top 2' } },
      { h: 'DISTINCT: duplicates collapse', fig: 'flow', say: 'DISTINCT removes duplicate <b>result rows</b>. Rema appears twice in the input but once in the output. Colours show which rows collapse together.',
        sql: 'SELECT DISTINCT artist\nFROM chart;', ins: [{ t: 'chart', m: ['g0', 'g1', 'g2', 'g1'] }],
        out: { c: ['artist'], r: [['Ayra Starr'], ['Rema'], ['Wizkid']], m: ['g0', 'g1', 'g2'] } }
    ],
    qs: [
      { k: 'tap', q: 'Tap the rows returned by <code>ORDER BY streams LIMIT 2</code> (ascending).', t: 'chart', ans: [2, 3], why: 'Ascending puts the smallest first: Charm (500), then Essence (700).' },
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT DISTINCT artist, title FROM chart;', o: ['4', '3', '2', '1'], why: 'DISTINCT applies to the whole selected row. Every (artist, title) pair is different, so all 4 stay.' }
    ] },
  sql4: {
    tables: { entries: ILL_ENT },
    scenes: [
      { h: 'GROUP BY: many rows become one per group', fig: 'flow', say: 'Each colour is one group (one artist). GROUP BY collapses each group into <b>one row</b>; aggregates (COUNT, SUM) summarise the rows inside it. 5 rows in, 3 rows out.',
        sql: 'SELECT artist, COUNT(*) AS songs, SUM(streams) AS total\nFROM entries\nGROUP BY artist;', ins: [{ t: 'entries', m: ['g0', 'g0', 'g1', 'g2', 'g1'] }],
        out: { c: ['artist', 'songs', 'total'], r: [['Rema', 2, 1700], ['Tems', 2, 1100], ['Wizkid', 1, 700]], m: ['g0', 'g1', 'g2'], nc: [1, 2] } },
      { h: 'WHERE filters rows before grouping', fig: 'flow', say: 'WHERE runs <b>first</b>, on single rows. Charm (500) and Me & U (300) are removed <b>before</b> the groups are built, so they never reach SUM.',
        sql: 'SELECT artist, SUM(streams) AS total\nFROM entries\nWHERE streams >= 700\nGROUP BY artist;', ins: [{ t: 'entries', m: ['g0', 'x', 'g1', 'g2', 'x'] }],
        out: { c: ['artist', 'total'], r: [['Rema', 1200], ['Tems', 800], ['Wizkid', 700]], m: ['g0', 'g1', 'g2'], nc: [1] } },
      { h: 'HAVING filters groups after grouping', fig: 'flow', say: 'HAVING runs <b>after</b> GROUP BY, on whole groups. Wizkid\'s group totals 700, so the whole group is removed.',
        sql: 'SELECT artist, SUM(streams) AS total\nFROM entries\nGROUP BY artist\nHAVING SUM(streams) > 1000;', ins: [{ t: 'entries', m: ['g0', 'g0', 'g1', 'x', 'g1'] }],
        out: { c: ['artist', 'total'], r: [['Rema', 1700], ['Tems', 1100]], m: ['g0', 'g1'], nc: [1] } }
    ],
    qs: [
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT artist, COUNT(*) FROM entries GROUP BY artist;', o: ['3', '5', '2', '1'], why: 'One row per distinct artist: Rema, Tems, Wizkid.' },
      { k: 'tap', q: 'Tap the rows that reach the groups in <code>WHERE streams &gt; 750 GROUP BY artist</code>.', t: 'entries', ans: [0, 2], why: 'WHERE filters single rows first: only Calm Down (1200) and Free Mind (800) pass.' },
      { k: 'mc', q: '"Only artists whose total streams exceed 1,000." Where does the condition go?', o: ['HAVING SUM(streams) > 1000', 'WHERE SUM(streams) > 1000', 'WHERE streams > 1000', 'ORDER BY SUM(streams) > 1000'], why: 'It is a condition on a group total, so it goes in HAVING, after GROUP BY.' }
    ] },
  sql6: {
    tables: { entries: ILL_ENT },
    scenes: [
      { h: 'A subquery used as a filter', fig: 'flow', say: 'The inner query runs first and returns <b>one value</b>: the average, 700. The outer WHERE then keeps rows above it. Essence (700) is not above 700.',
        sql: 'SELECT title, streams\nFROM entries\nWHERE streams > (SELECT AVG(streams) FROM entries);', ins: [{ t: 'entries', m: ['m', 'x', 'm', 'x', 'x'] }],
        out: { c: ['title', 'streams'], r: [['Calm Down', 1200], ['Free Mind', 800]], m: ['m', 'm'] } }
    ],
    qs: [{ k: 'mc', q: 'What single value does the subquery <code>(SELECT AVG(streams) FROM entries)</code> return?', o: ['700', '3500', '1200', '5'], why: '(1200 + 500 + 800 + 700 + 300) / 5 = 700.' }] },
  sql7: {
    tables: { entries: ILL_ENT, chart_mon: ILT('chart_mon', ['title'], [['Rush'], ['Calm Down']]), chart_tue: ILT('chart_tue', ['title'], [['Calm Down'], ['Essence']]) },
    scenes: [
      { h: 'A CTE is a named, temporary result', fig: 'flow', say: 'The CTE <code>totals</code> is computed first (one row per artist) and exists only for this query. The final SELECT reads it like a table.',
        sql: 'WITH totals AS (\n  SELECT artist, SUM(streams) AS total\n  FROM entries GROUP BY artist\n)\nSELECT artist, total\nFROM totals\nWHERE total > 1000;',
        ins: [{ t: 'entries', m: ['g0', 'g0', 'g1', 'g2', 'g1'], role: 'entries (stored)' }, { tab: ILT('totals', ['artist', 'total'], [['Rema', 1700], ['Tems', 1100], ['Wizkid', 700]]), m: ['g0', 'g1', 'x'], role: 'totals (the CTE: step 1)' }],
        out: { c: ['artist', 'total'], r: [['Rema', 1700], ['Tems', 1100]], m: ['g0', 'g1'] } },
      { h: 'UNION ALL stacks every row', fig: 'flow', say: 'UNION ALL puts the second result <b>under</b> the first. Calm Down is in both, so it appears twice.',
        sql: 'SELECT title FROM chart_mon\nUNION ALL\nSELECT title FROM chart_tue;', ins: [{ t: 'chart_mon', m: ['g0', 'g1'] }, { t: 'chart_tue', m: ['g1', 'g2'] }],
        out: { c: ['title'], r: [['Rush'], ['Calm Down'], ['Calm Down'], ['Essence']], m: ['g0', 'g1', 'd', 'g2'] }, lg: { d: '⧉ duplicate: UNION ALL keeps it' } },
      { h: 'UNION removes duplicates', fig: 'flow', say: 'UNION stacks too, then <b>removes duplicate rows</b>: 3 rows. That extra step costs time, so use UNION ALL unless you need deduplication.',
        sql: 'SELECT title FROM chart_mon\nUNION\nSELECT title FROM chart_tue;', ins: [{ t: 'chart_mon', m: ['g0', 'g1'] }, { t: 'chart_tue', m: ['d', 'g2'] }], lg: { d: '⧉ duplicate: UNION removes it' },
        out: { c: ['title'], r: [['Calm Down'], ['Essence'], ['Rush']], m: ['g1', 'g2', 'g0'] } }
    ],
    qs: [
      { k: 'mc', q: 'How many rows does <code>UNION ALL</code> return here?', sql: 'SELECT title FROM chart_mon UNION ALL SELECT title FROM chart_tue;', o: ['4', '3', '2', '6'], why: '2 + 2 = 4. UNION ALL keeps the duplicate Calm Down.' },
      { k: 'mc', q: 'And with <code>UNION</code>?', sql: 'SELECT title FROM chart_mon UNION SELECT title FROM chart_tue;', o: ['3', '4', '2', '1'], why: 'Rush, Calm Down, Essence: the duplicate is removed.' }
    ] },
  sql8: {
    tables: { chart: ILL_POS },
    scenes: [
      { h: 'PARTITION BY + LAG: rows are kept', fig: 'flow', say: 'Unlike GROUP BY, a window function <b>keeps every row</b> (5 in, 5 out) and <b>adds a column</b>. PARTITION BY title splits rows into groups (colours); LAG reads the previous row in the same group.',
        sql: 'SELECT title, chart_date, position,\n  LAG(position) OVER (PARTITION BY title ORDER BY chart_date) AS prev\nFROM chart;', ins: [{ t: 'chart', m: ['g0', 'g0', 'g1', 'g1', 'g2'] }],
        out: { c: ['title', 'chart_date', 'position', 'prev'], r: [['Calm Down', '10-16', 1, null], ['Calm Down', '10-17', 2, 1], ['Essence', '10-17', 3, null], ['Rush', '10-16', 2, null], ['Rush', '10-17', 1, 2]], m: ['g0', 'g0', 'g2', 'g1', 'g1'], nc: [3] },
        note: 'The first row of each group has no previous row, so <code>prev</code> is NULL.' },
      { h: 'ROW_NUMBER numbers rows inside each partition', fig: 'flow', say: 'PARTITION BY chart_date: each day starts again at 1. Still 5 rows out.',
        sql: 'SELECT chart_date, title, position,\n  ROW_NUMBER() OVER (PARTITION BY chart_date ORDER BY position) AS rn\nFROM chart;', ins: [{ t: 'chart', m: ['g0', 'g1', 'g0', 'g1', 'g1'] }],
        out: { c: ['chart_date', 'title', 'position', 'rn'], r: [['10-16', 'Calm Down', 1, 1], ['10-16', 'Rush', 2, 2], ['10-17', 'Rush', 1, 1], ['10-17', 'Calm Down', 2, 2], ['10-17', 'Essence', 3, 3]], m: ['g0', 'g0', 'g1', 'g1', 'g1'], nc: [3] } }
    ],
    qs: [
      { k: 'mc', q: 'How many rows does this return?', sql: 'SELECT title, LAG(position) OVER (PARTITION BY title ORDER BY chart_date) FROM chart;', o: ['5', '3', '2', '1'], why: 'Window functions keep every row: 5 in, 5 out. GROUP BY title would return 3.' },
      { k: 'mc', q: 'Why is <code>prev</code> NULL for Essence?', o: ['It is the first (only) row in its partition, so there is no previous row', 'Essence has no position', 'LAG always returns NULL for the last row', 'Essence was filtered out'], why: 'LAG looks one row back inside the same partition. Essence\'s partition has one row.' }
    ] },
  sql9: {
    tables: { raw: ILT('raw', ['title', 'streams'], [['  Rush ', '900'], ['Calm Down', null], ['Essence', '700']]) },
    scenes: [
      { h: 'Cleaning keeps the rows, fixes the values', fig: 'flow', say: 'TRIM removes the spaces (shown as ␣), CAST turns text into numbers, COALESCE replaces NULL with 0. Same rows, cleaner values.',
        sql: 'SELECT TRIM(title) AS title,\n  COALESCE(CAST(streams AS INTEGER), 0) AS streams\nFROM raw;', ins: [{ t: 'raw', m: ['n', 'n', 'm'] }],
        out: { c: ['title', 'streams'], r: [['Rush', 900], ['Calm Down', 0], ['Essence', 700]], m: ['n', 'n', 'm'] }, lg: { n: '＋ value changed', m: '✓ unchanged' } }
    ],
    qs: [{ k: 'mc', q: 'Why does Calm Down end up with streams = 0?', o: ['Its streams was NULL and COALESCE(…, 0) replaced it', 'CAST turns text into 0', 'TRIM removed the number', 'The row was filtered out'], why: 'COALESCE returns the first non-NULL argument: NULL → 0.' }] },
  etl1: {
    tables: { raw_tracks: ILT('raw_tracks', ['title', 'streams'], [[' Rush', '900'], [null, '450'], ['Essence ', '700']]) },
    scenes: [
      { h: 'Transform: raw → staging', fig: 'flow', say: 'The raw layer keeps the source exactly as received. The transform step cleans it into staging: it trims text, converts types and <b>drops rows that fail a rule</b> (no title).',
        sql: "SELECT TRIM(title) AS title, CAST(streams AS INTEGER) AS streams\nFROM raw_tracks\nWHERE title IS NOT NULL;", ins: [{ t: 'raw_tracks', m: ['n', 'x', 'n'], role: 'raw (untouched)' }],
        out: { c: ['title', 'streams'], r: [['Rush', 900], ['Essence', 700]], m: ['n', 'n'] }, lg: { n: '＋ cleaned' } }
    ],
    qs: [{ k: 'mc', q: 'After this transform, how many rows reach staging?', o: ['2', '3', '1', '0'], why: 'The row with a missing title fails the rule; the other two are cleaned and kept. Raw still has all 3.' }] },
  etl2: {
    tables: { target: ILT('target', ['chart_date', 'title'], [['10-16', 'Rush'], ['10-16', 'Calm Down'], ['10-17', 'Rush'], ['10-17', 'Calm Down']]), batch: ILT('batch', ['chart_date', 'title'], [['10-17', 'Rush'], ['10-17', 'Calm Down']]) },
    scenes: [
      { h: 'A retry with plain INSERT duplicates rows', fig: 'flow', say: 'The 10-17 load already ran once (4 rows). The scheduler retries it. A plain INSERT adds the same 2 rows again: 6 rows, 2 of them duplicates.',
        sql: "INSERT INTO target SELECT * FROM batch;\nSELECT * FROM target;", ins: [{ t: 'target', role: 'target before the retry' }, { t: 'batch', role: 'batch for 10-17' }],
        out: { c: ['chart_date', 'title'], r: [['10-16', 'Rush'], ['10-16', 'Calm Down'], ['10-17', 'Rush'], ['10-17', 'Calm Down'], ['10-17', 'Rush'], ['10-17', 'Calm Down']], m: ['m', 'm', 'm', 'm', 'd', 'd'] } },
      { h: 'Delete-then-insert is idempotent', fig: 'flow', say: 'First delete the run date\'s rows, then insert the batch. Run it once or ten times: always 4 rows. Other dates are untouched.',
        sql: "DELETE FROM target WHERE chart_date = '10-17';\nINSERT INTO target SELECT * FROM batch;\nSELECT * FROM target;", ins: [{ t: 'target', m: ['m', 'm', 'x', 'x'], role: 'target before' }, { t: 'batch', m: ['n', 'n'], role: 'batch for 10-17' }],
        out: { c: ['chart_date', 'title'], r: [['10-16', 'Rush'], ['10-16', 'Calm Down'], ['10-17', 'Rush'], ['10-17', 'Calm Down']], m: ['m', 'm', 'n', 'n'] }, lg: { x: '✕ deleted first', n: '＋ inserted again' } }
    ],
    qs: [
      { k: 'mc', q: 'The plain INSERT job is retried <b>twice more</b> for 10-17 (starting from the 4-row table). How many rows?', o: ['8', '6', '4', '10'], why: 'Each retry adds the 2 rows again: 4 + 2 + 2 = 8.' },
      { k: 'mc', q: 'The delete-then-insert job runs 3 times for 10-17. How many rows?', o: ['4', '8', '6', '2'], why: 'Each run deletes the 10-17 rows first, so the result is the same every time: idempotent.' }
    ] },
  etl4: {
    tables: { raw_tracks: ILT('raw_tracks', ['track_id', 'title', 'loaded_at'], [[1, 'Rush', '08:00'], [1, 'Rush', '09:00'], [2, 'Essence', '08:00']]) },
    scenes: [
      { h: 'A quality check that should return zero rows', fig: 'flow', say: 'A uniqueness check groups by the key and keeps keys that appear more than once. A healthy table returns <b>no rows</b>; here track 1 is duplicated.',
        sql: 'SELECT track_id, COUNT(*) AS n\nFROM raw_tracks\nGROUP BY track_id\nHAVING COUNT(*) > 1;', ins: [{ t: 'raw_tracks', m: ['g0', 'g0', 'x'] }],
        out: { c: ['track_id', 'n'], r: [[1, 2]], m: ['g0'], nc: [1] } },
      { h: 'Dedupe: keep the latest row per key', fig: 'flow', say: 'ROW_NUMBER numbers each track\'s rows, newest first; keeping rn = 1 leaves one row per track.',
        sql: 'WITH r AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY track_id ORDER BY loaded_at DESC) AS rn\n  FROM raw_tracks\n)\nSELECT track_id, title, loaded_at FROM r WHERE rn = 1;', ins: [{ t: 'raw_tracks', m: ['x', 'g0', 'g1'] }],
        out: { c: ['track_id', 'title', 'loaded_at'], r: [[1, 'Rush', '09:00'], [2, 'Essence', '08:00']], m: ['g0', 'g1'] } }
    ],
    qs: [{ k: 'tap', q: 'Tap the rows the dedupe keeps.', t: 'raw_tracks', ans: [1, 2], why: 'One row per track_id, the latest load: Rush 09:00 and Essence 08:00.' }] },
  pj3: {
    tables: {},
    scenes: [
      { h: 'Flattening: nested JSON → one row per track', fig: 'flow', say: 'The API returns one nested document. transform.py walks <code>tracks</code> and turns each track into one flat row. The list order becomes the chart position.',
        code: 'for position, t in enumerate(payload["tracks"], start=1):\n    rows.append({"chart_date": payload["chart_date"], "position": position,\n                 "title": t["title"].strip(), "artist": t["artist"]["name"]})',
        ins: [{ raw: '{"chart_date": "2026-10-17",\n "tracks": [\n   {"title": "Rush ", "artist": {"name": "Ayra Starr"}},\n   {"title": "Calm Down", "artist": {"name": "Rema"}}\n ]}', role: 'raw JSON (one document)' }],
        out: { c: ['chart_date', 'position', 'title', 'artist'], r: [['2026-10-17', 1, 'Rush', 'Ayra Starr'], ['2026-10-17', 2, 'Calm Down', 'Rema']], m: ['n', 'n'] }, lg: { n: '＋ one row per track' } }
    ],
    qs: [{ k: 'mc', q: 'The JSON has 50 tracks. How many rows does the flattening produce?', o: ['50', '1', '9', '450'], why: 'One row per track. (9 is the number of keys, i.e. columns, per row.)' }] },
  pj4: {
    tables: { chart_entries: ILT('chart_entries', ['chart_date', 'track_id', 'title'], [['10-16', 1, 'Rush'], ['10-17', 1, 'Rush'], ['10-17', 2, 'Calm Down']], 'CREATE TABLE chart_entries (chart_date, track_id, title, PRIMARY KEY (chart_date, track_id));'),
      batch: ILT('batch', ['chart_date', 'track_id', 'title'], [['10-17', 1, 'Rush'], ['10-17', 2, 'Calm Down'], ['10-17', 3, 'Charm']]) },
    scenes: [
      { h: 'The primary key refuses a duplicate load', fig: 'flow', say: '<code>PRIMARY KEY (chart_date, track_id)</code> enforces the grain. Re-inserting 10-17 fails instead of silently duplicating.',
        sql: 'INSERT INTO chart_entries SELECT * FROM batch;', ins: [{ t: 'chart_entries', role: 'chart_entries (PK chart_date, track_id)' }, { t: 'batch', m: ['d', 'd', 'n'], role: 'rerun batch for 10-17' }],
        out: { err: 'UNIQUE constraint failed' }, lg: { d: '⧉ key already exists' } },
      { h: 'load.py: delete the date, then insert', fig: 'flow', say: 'load.py deletes the run date first, then inserts the fresh batch (now with a late Charm). 10-16 is untouched.',
        sql: "DELETE FROM chart_entries WHERE chart_date = '10-17';\nINSERT INTO chart_entries SELECT * FROM batch;\nSELECT * FROM chart_entries;", ins: [{ t: 'chart_entries', m: ['m', 'x', 'x'] }, { t: 'batch', m: ['n', 'n', 'n'] }],
        out: { c: ['chart_date', 'track_id', 'title'], r: [['10-16', 1, 'Rush'], ['10-17', 1, 'Rush'], ['10-17', 2, 'Calm Down'], ['10-17', 3, 'Charm']], m: ['m', 'n', 'n', 'n'] }, lg: { x: '✕ deleted first', n: '＋ inserted' } }
    ],
    qs: [{ k: 'mc', q: 'After delete-then-insert for 10-17, how many rows does chart_entries have?', o: ['4', '6', '3', '5'], why: '1 untouched 10-16 row + the 3 batch rows for 10-17.' }] },
  pj5: {
    tables: { chart_entries: ILT('chart_entries', ['chart_date', 'track_id', 'title', 'artist', 'position'], [['10-16', 1, 'Rush', 'Ayra Starr', 2], ['10-17', 1, 'Rush', 'Ayra Starr', 1], ['10-16', 2, 'Calm Down', 'Rema', 1], ['10-17', 2, 'Calm Down', 'Rema', 3], ['10-17', 3, 'Charm', 'Rema', 2]]) },
    scenes: [
      { h: 'chart_movement keeps every row, adds columns', fig: 'flow', say: 'The view adds <code>prev_position</code> (LAG per track) and <code>places_gained</code>. 5 rows in, 5 rows out. A new entry has no previous row, so both are NULL.',
        sql: 'SELECT chart_date, title, position,\n  LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) AS prev_position,\n  LAG(position) OVER (PARTITION BY track_id ORDER BY chart_date) - position AS places_gained\nFROM chart_entries;', ins: [{ t: 'chart_entries', m: ['g0', 'g0', 'g1', 'g1', 'g2'] }],
        out: { c: ['chart_date', 'title', 'position', 'prev_position', 'places_gained'], r: [['10-16', 'Rush', 2, null, null], ['10-17', 'Rush', 1, 2, 1], ['10-16', 'Calm Down', 1, null, null], ['10-17', 'Calm Down', 3, 1, -2], ['10-17', 'Charm', 2, null, null]], m: ['g0', 'g0', 'g1', 'g1', 'g2'], nc: [3, 4] } },
      { h: 'artist_summary collapses to one row per artist', fig: 'flow', say: 'GROUP BY artist: 5 rows become 2. COUNT(DISTINCT track_id) counts songs, not chart days.',
        sql: 'SELECT artist, COUNT(DISTINCT track_id) AS songs_charted, MIN(position) AS best_position\nFROM chart_entries\nGROUP BY artist;', ins: [{ t: 'chart_entries', m: ['g0', 'g0', 'g1', 'g1', 'g1'] }],
        out: { c: ['artist', 'songs_charted', 'best_position'], r: [['Ayra Starr', 1, 1], ['Rema', 2, 1]], m: ['g0', 'g1'], nc: [1, 2] } }
    ],
    qs: [
      { k: 'mc', q: 'What is <code>places_gained</code> for Charm on 10-17?', o: ['NULL: it is a new entry with no previous position', '0', '2', '-2'], why: 'prev_position is NULL, and NULL − 2 is NULL.' },
      { k: 'mc', q: 'chart_movement vs artist_summary: how many rows each, from these 5 rows?', o: ['5 and 2', '2 and 5', '5 and 5', '3 and 2'], why: 'Window functions keep rows; GROUP BY collapses them.' }
    ] }
};
// a before/after figure for building blocks (grounding) as well
const ILL_COND = { h: '', fig: 'flow', sql: 'SELECT title, streams\nFROM songs\nWHERE streams > 800;', norun: true,
  ins: [{ tab: ILT('songs', ['title', 'artist', 'streams'], [['Rush', 'Ayra Starr', 900], ['Calm Down', 'Rema', 1200], ['Essence', 'Wizkid', 700]]), m: ['m', 'm', 'x'], role: 'Before: table songs' }],
  out: { c: ['title', 'streams'], r: [['Rush', 900], ['Calm Down', 1200]], m: ['m', 'm'] }, lg: { m: '✓ condition TRUE: kept', x: '✕ condition FALSE: dropped' } };

/* v7: entities, state, events, relationships (before joins) and many-to-many (after joins) */
const ERD_ART = { n: 'artists', cols: [['artist_id', 'PK'], ['name'], ['label']] };
const ERD_SNG = { n: 'songs', cols: [['song_id', 'PK'], ['title'], ['artist_id', 'FK']] };
const ERD_LIS = { n: 'listeners', cols: [['listener_id', 'PK'], ['name']] };
const ERD_STR = { n: 'streams', sub: 'events', cols: [['stream_id', 'PK'], ['listener_id', 'FK'], ['song_id', 'FK'], ['streamed_at']] };
const ERD_L_SA = { f: ['songs', 'artist_id'], t: ['artists', 'artist_id'] };
const ERD_L_SL = { f: ['streams', 'listener_id'], t: ['listeners', 'listener_id'] };
const ERD_L_SS = { f: ['streams', 'song_id'], t: ['songs', 'song_id'] };
const erdAt = (o, x, y, more) => Object.assign({}, o, { x, y }, more || {});
ILLUS.sqlr = {
  tables: {
    songs_flat: ILT('songs_flat', ['title', 'artist', 'label'], [['Last Last', 'Burna Boy', 'Spaceship'], ["It's Plenty", 'Burna Boy', 'Spaceship'], ['City Boys', 'Burna Boi', 'Spaceship'], ['Free Mind', 'Tems', 'RCA'], ['Me & U', 'Tems', 'RCA']]),
    artists: ILT('artists', ['artist_id', 'name', 'label'], [[1, 'Burna Boy', 'Spaceship'], [2, 'Tems', 'RCA'], [3, 'Asake', 'YBNL']]),
    songs: ILT('songs', ['song_id', 'title', 'artist_id'], [[10, 'Last Last', 1], [11, 'Free Mind', 2], [12, 'Joha', 3], [13, 'City Boys', 1]]),
    listeners: ILT('listeners', ['listener_id', 'name'], [[100, 'Ada'], [101, 'Tunde'], [102, 'Zainab']]),
    streams: ILT('streams', ['stream_id', 'listener_id', 'song_id', 'streamed_at'], [[1, 100, 10, '21:14'], [2, 100, 11, '21:18'], [3, 101, 10, '22:02']])
  },
  scenes: [
    { h: 'One big table repeats itself',
      say: 'Imagine keeping everything in one table. Each row is a song, but it also <b>copies</b> the artist\u2019s name and label. Burna Boy\u2019s label is written 3 times and Tems\u2019 twice. Every copy is a chance for the data to disagree.',
      ins: [{ t: 'songs_flat', m: ['d', 'd', 'd', 'd', 'd'], role: 'one big table' }], lg: { d: 'artist + label copied again' },
      note: 'Look closely at row 3: "Burna Boi". The next two pictures show why copies hurt.' },
    { h: 'Problem 1: an update misses copies',
      say: 'Burna Boy moves to Atlantic. Someone updates <b>one</b> row. The other copies still say Spaceship, so the table now gives two different answers to "what is Burna Boy\u2019s label?".',
      sql: "UPDATE songs_flat SET label = 'Atlantic'\nWHERE title = 'Last Last';\nSELECT title, artist, label FROM songs_flat\nWHERE artist LIKE 'Bur%';",
      ins: [{ t: 'songs_flat', m: ['n', 'u', 'u'], role: 'one big table' }],
      out: { c: ['title', 'artist', 'label'], r: [['Last Last', 'Burna Boy', 'Atlantic'], ["It's Plenty", 'Burna Boy', 'Spaceship'], ['City Boys', 'Burna Boi', 'Spaceship']], m: ['n', 'u', 'u'] },
      lg: { n: 'updated', u: 'missed copy: now the data disagrees' } },
    { h: 'Problem 2: a typo invents an artist',
      say: 'Ask for the distinct artists. Because the name is typed on every row, one typo ("Burna Boi") creates an artist who does not exist.',
      sql: 'SELECT DISTINCT artist, label\nFROM songs_flat;',
      ins: [{ t: 'songs_flat', m: ['m', 'm', 'u', 'm', 'm'], role: 'one big table' }],
      out: { c: ['artist', 'label'], r: [['Burna Boy', 'Spaceship'], ['Burna Boi', 'Spaceship'], ['Tems', 'RCA']], m: ['m', 'u', 'm'] },
      lg: { m: 'real artist', u: 'typo = a fake extra artist' } },
    { h: 'The fix: split it so each fact lives once',
      say: 'Put artists in their own table, one row each, with an ID. Songs keep only the artist\u2019s <b>ID</b>. The repetition disappears. A label change is now <b>one</b> UPDATE, and a song cannot point at "Burna Boi" because it stores the number 1, not a name.',
      ins: [{ t: 'songs_flat', m: ['d', 'd', 'd', 'd', 'd'], role: 'before: copies everywhere' }],
      after: [{ t: 'artists', m: ['n', 'n', 'n'], role: 'artists: each label stored once' }, { t: 'songs', role: 'songs: point at the artist by ID' }],
      lg: { d: 'copied fact', n: 'stored once' } },
    { h: 'Entities: things that exist on their own', fig: 'ent',
      say: 'An <b>entity</b> is a thing that exists by itself and that we store facts about. Artists, songs and listeners exist whether or not anything happens today. Each entity gets <b>its own table</b> and <b>its own ID</b> (the primary key).' },
    { h: 'State: a fact that changes and gets overwritten', fig: 'state', fp: { who: 'Burna Boy · label', vals: [['last week', 'Spaceship'], ['today', 'Atlantic']] },
      say: '<b>State</b> is a current fact about an entity, such as an artist\u2019s label or a song\u2019s chart position today. It lives in a column. When it changes we UPDATE, and the old value is <b>gone</b> unless we deliberately keep history.',
      sql: "UPDATE artists SET label = 'Atlantic'\nWHERE artist_id = 1;\nSELECT * FROM artists;",
      ins: [{ t: 'artists', m: ['n'], role: 'before' }],
      out: { c: ['artist_id', 'name', 'label'], r: [[1, 'Burna Boy', 'Atlantic'], [2, 'Tems', 'RCA'], [3, 'Asake', 'YBNL']], m: ['n', '', ''] },
      lg: { n: 'same row, value overwritten ("Spaceship" is lost)' } },
    { h: 'Events: things that happen, one new row each', fig: 'events', fp: [['21:14', '🎧 Ada ▶ Last Last'], ['21:18', '🎧 Ada ▶ Free Mind'], ['22:02', '🎧 Tunde ▶ Last Last']],
      say: 'An <b>event</b> happens at a moment. It did not exist before, and once it has happened it never changes. Each event becomes a <b>new row</b> holding a time plus the IDs of the entities involved (who listened, to which song).',
      sql: 'SELECT * FROM streams\nORDER BY streamed_at;', ordered: true,
      out: { c: ['stream_id', 'listener_id', 'song_id', 'streamed_at'], r: [[1, 100, 10, '21:14'], [2, 100, 11, '21:18'], [3, 101, 10, '22:02']], m: ['n', 'n', 'n'] },
      lg: { n: 'one new row per event' } },
    { h: 'Relationships: fixed, or created by events', fig: 'bip',
      fp: { lt: 'listeners', rt: 'songs', l: ['Ada', 'Tunde', 'Zainab'], r: ['Last Last', 'Free Mind', 'Joha'], e: [[0, 0, 'd'], [0, 1, 'd'], [1, 0, 'd']],
        cap: 'Dashed lines exist <b>only because a stream happened</b>. Each one is a row in <code>streams</code>. Zainab has streamed nothing, so she has <b>no link</b> to any song yet. Compare: "Last Last belongs to Burna Boy" is a <b>fixed</b> fact, stored once in <code>songs.artist_id</code>.' },
      say: 'A <b>relationship</b> is how entities connect. Some are <b>fixed facts</b>: a song belongs to one artist, stored as a foreign key. Others are <b>created by events</b>: a listener and a song are unrelated until a stream happens, and then the stream row <i>is</i> the link.' },
    { h: 'Keys: the arrow from one table to another', fig: 'erd',
      fp: { boxes: [erdAt(ERD_ART, 6, 6), erdAt(ERD_SNG, 214, 6)], links: [ERD_L_SA], label: 'songs.artist_id points to artists.artist_id' },
      say: 'The <b>primary key</b> (PK) identifies each row in its own table: <code>artists.artist_id</code>. A <b>foreign key</b> (FK) is a column that holds another table\u2019s PK: <code>songs.artist_id</code>. Draw it as an arrow from the FK to the PK. Following the arrow by hand looks like this:',
      sql: "SELECT name FROM artists\nWHERE artist_id = 1;  -- Last Last's artist_id",
      out: { c: ['name'], r: [['Burna Boy']], m: ['m'] }, lg: { m: 'the row the arrow points at' } },
    { h: 'Three kinds of relationship', fig: 'kinds',
      say: 'Count how many rows can sit at each end of a line. That count tells you where the key goes.' },
    { h: 'The ERD: what can join to what', fig: 'erd',
      fp: { boxes: [erdAt(ERD_ART, 6, 6, { hl: 1 }), erdAt(ERD_SNG, 214, 6, { hl: 1 }), erdAt(ERD_LIS, 6, 102, { hl: 1 }), erdAt(ERD_STR, 214, 102, { hl: 1 })],
        links: [Object.assign({ hl: 1 }, ERD_L_SA), Object.assign({ hl: 1 }, ERD_L_SL), Object.assign({ hl: 1 }, ERD_L_SS)], label: 'ERD of artists, songs, listeners and streams',
        cap: 'Path from a listener to an artist: <b>listeners → streams → songs → artists</b>. There is <b>no line</b> between listeners and artists (no shared ID), so they cannot be joined directly.' },
      say: 'An <b>ERD</b> (entity-relationship diagram) draws every table as a box and every FK → PK link as a line. The crow\u2019s foot marks the <b>many</b> end. Tables connect only along these lines: shared IDs are what make a connection meaningful.' }
  ],
  qs: [
    { k: 'cls', q: 'Sort each one: entity, state, event or relationship?', cats: ['Entity', 'State', 'Event', 'Relationship'],
      items: [['Burna Boy (an artist)', 0], ['Calm Down is #1 on today\u2019s chart', 1], ['Ada streamed Last Last at 21:14', 2], ['Last Last belongs to Burna Boy', 3], ['Tems is signed to RCA (for now)', 1], ['a listener', 0]],
      why: 'Artists and listeners exist on their own (entities). Chart position and current label are changeable facts (state). A stream happened at a moment (event). "Belongs to" connects two entities (relationship).' },
    { k: 'mc', q: 'Which tables connect <b>listeners</b> to <b>artists</b>?', o: ['streams, then songs', 'none: join listeners to artists directly', 'playlists only', 'artists already has a listener_id'],
      why: 'listeners → streams (listener_id) → songs (song_id) → artists (artist_id). listeners and artists share no column.' },
    { k: 'tapc', q: 'Tap the <b>foreign key</b> column in songs.', t: 'songs', ans: [2],
      why: '<code>songs.artist_id</code> holds values of another table\u2019s primary key (<code>artists.artist_id</code>). <code>song_id</code> is songs\u2019 own primary key.' },
    { k: 'mc', q: 'An artist has many songs, and each song has one artist. Which kind of relationship is that?', o: ['one-to-many', 'one-to-one', 'many-to-many', 'no relationship'],
      why: 'One artist row, many song rows. The FK sits on the many side (songs).' },
    { k: 'mc', q: 'Which pair can <b>not</b> be joined directly?', o: ['listeners and artists', 'songs and artists', 'streams and songs', 'streams and listeners'],
      why: 'listeners and artists share no ID and no line joins them in the ERD. You have to go through streams and songs.' },
    { k: 'mc', q: 'What goes wrong with the one big table?', o: ['a change must be repeated on every copy, and one typo creates a fake artist', 'nothing: one table is always best', 'SQL cannot read tables with text', 'it can only hold 5 rows'],
      why: 'Repeated facts give update problems (missed copies) and typo problems (Burna Boi). Splitting stores each fact once.' },
    { k: 'tap', q: 'Tap the listeners who are linked to at least one song.', t: 'listeners', ans: [0, 1],
      why: 'Ada and Tunde have stream rows. Zainab has none, so no link exists yet.' },
    { k: 'mc', q: 'Zainab has never streamed anything. Is she related to any song?', o: ['No: the link only appears when a stream event is stored', 'Yes, to every song', 'Yes, through artists', 'Yes, through a listener_id in songs'],
      why: 'Listener–song links are created by events. No stream row means no link.' },
    { k: 'mc', q: 'Ada streams Last Last again tomorrow. What happens in streams?', o: ['a new row is added and old rows stay unchanged', 'row 1 gets the new time', 'nothing: she already has that link', 'the songs row is updated'],
      why: 'Every play is a new event row. Events are never edited, which is why Ada can appear with the same song many times.' },
    { k: 'mc', q: 'After <code>UPDATE artists SET label = \'Atlantic\' WHERE artist_id = 1</code>, where is "Spaceship"?', o: ['gone, unless history was kept on purpose', 'in a second row for Burna Boy', 'in the streams table', 'still in the label column next to Atlantic'],
      why: 'State is overwritten. To keep the old value you need a history table (or a slowly changing dimension).' },
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
      say: 'Listeners and songs are <b>many-to-many</b>. Every line in the picture becomes <b>one row</b> in a linking table, here <code>streams</code>.',
      ins: [{ t: 'streams', role: 'streams: one row per line above' }] },
    { h: 'Join 1: streams → listeners', fig: 'flow',
      say: 'Start from the linking table and follow one arrow: <code>streams.listener_id → listeners</code>. Each stream picks up its listener\u2019s name. Zainab has no stream rows, so nothing points at her.',
      sql: 'SELECT st.stream_id, l.name, st.song_id\nFROM streams st\nJOIN listeners l\n  ON l.listener_id = st.listener_id;',
      ins: [{ t: 'streams', m: ['g0', 'g0', 'g1', 'g1'], role: 'linking table (FROM)' }, { t: 'listeners', m: ['g0', 'g1', 'x'], role: 'JOIN ➡' }],
      out: { c: ['stream_id', 'name', 'song_id'], r: [[1, 'Ada', 10], [2, 'Ada', 11], [3, 'Tunde', 10], [4, 'Tunde', 12]], m: ['g0', 'g0', 'g1', 'g1'] },
      lg: { g: 'colour = same listener', x: 'no stream points here' } },
    { h: 'Join 2: … → songs. Two joins, one per arrow', fig: 'flow',
      say: 'Add the second arrow: <code>streams.song_id → songs</code>. Now each row reads "listener played song". The result has <b>one row per stream</b>, not one per listener.',
      sql: 'SELECT l.name, s.title\nFROM streams st\nJOIN listeners l ON l.listener_id = st.listener_id\nJOIN songs s     ON s.song_id = st.song_id;',
      ins: [{ t: 'listeners', m: ['g0', 'g1', 'x'], role: 'listeners' }, { t: 'streams', m: ['g0', 'g0', 'g1', 'g1'], role: 'streams (the link)' }, { t: 'songs', m: ['m', 'm', 'm'], role: 'songs' }],
      out: { c: ['name', 'title'], r: [['Ada', 'Last Last'], ['Ada', 'Free Mind'], ['Tunde', 'Last Last'], ['Tunde', 'Joha']], m: ['g0', 'g0', 'g1', 'g1'] },
      lg: { g: 'colour = same listener', x: 'no streams: dropped by INNER JOIN' } },
    { h: 'Read it the other way round', fig: 'flow',
      say: 'The same linking table also answers "who played this song?". Group the streams by song: Last Last has 2 listeners, the others have 1.',
      sql: 'SELECT s.title, COUNT(*) AS listeners\nFROM streams st\nJOIN songs s ON s.song_id = st.song_id\nGROUP BY s.title;',
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
    '<div class="figcap">Exist on their own, even if nothing ever happens. <b>Not</b> entities: <i>a play at 21:14</i> (an event) or <i>today\u2019s chart position</i> (a state).</div>',
  // state: one value per entity, overwritten over time
  state: sc => { const f = sc.fp; return '<div class="stf"><div class="stw">' + _h(f.who) + '</div><div class="stl">' + f.vals.map((v, i) => {
      const last = i === f.vals.length - 1; return '<div class="sts' + (last ? ' now' : ' old') + '"><div class="stt">' + _h(v[0]) + '</div><div class="stv">' + (last ? '' : '<s>') + _h(v[1]) + (last ? '' : '</s>') + '</div><div class="muted small">' + (last ? 'current value' : 'overwritten: lost') + '</div></div>' + (last ? '' : '<div class="farr">→<div class="small muted">UPDATE</div></div>'); }).join('') + '</div></div>' +
    '<div class="figcap">Still <b>one</b> row for the artist. The column holds only the latest value.</div>'; },
  // events: rows appearing along a time line, never changed afterwards
  events: sc => '<div class="evf">' + sc.fp.map((e, i) => '<div class="evr"><div class="evt">' + _h(e[0]) + '</div><div class="evd"></div><div class="evx">' + e[1] + '</div><div class="evn">+ row ' + (i + 1) + '</div></div>').join('') + '</div>' +
    '<div class="figcap">Each happening adds a <b>new row</b> with its time and the IDs involved. Old rows are never edited.</div>',
  // the three kinds of relationship
  kinds: () => [
    ['One-to-many', { lt: 'artists', rt: 'songs', l: ['Burna Boy', 'Tems'], r: ['Last Last', 'City Boys', 'Free Mind'], e: [[0, 0], [0, 1], [1, 2]] }, 'Each song has exactly one artist; an artist has many songs. The FK sits on the <b>many</b> side: <code>songs.artist_id</code>.'],
    ['One-to-one', { lt: 'artists', rt: 'profiles', l: ['Burna Boy', 'Tems'], r: ['profile 1', 'profile 2'], e: [[0, 0], [1, 1]] }, 'Each artist has one profile. <code>profiles.artist_id</code> is unique (often the profile\u2019s own PK).'],
    ['Many-to-many', { lt: 'listeners', rt: 'songs', l: ['Ada', 'Tunde'], r: ['Last Last', 'Free Mind'], e: [[0, 0], [0, 1], [1, 0]] }, 'Many on <b>both</b> sides. No single FK column can hold it: it needs a <b>linking table</b> of pairs (streams; for playlists, playlist_songs).']
  ].map(k => '<div class="kind"><div class="kh">' + k[0] + '</div>' + bipSVG(k[1]) + '<div class="figcap">' + k[2] + '</div></div>').join('')
};

/* ---------- v6 illustration rendering (before → query → after) ---------- */
const ILL_LG = { m: '✓ kept / matched', u: '◐ kept with no match: the other side is NULL', x: '✕ not in the result', d: '⧉ duplicate', n: '＋ new or changed', g: '🎨 same colour = same group' };
const ILL_ICON = { m: '✓', u: '◐', x: '✕', d: '⧉', n: '＋' };
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
      return '<tr class="' + cls + '"' + attr + '>' + (hasMk ? '<td class="mk">' + (ILL_ICON[mk] || '') + '</td>' : '') + r.map((v, j) => illCell(v).replace('<td', nc.includes(j) ? '<td data-new="1"' : '<td')).join('') + '</tr>';
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
function illTab(L, x) { return x.tab || (L && L.tables[x.t]); }
// the whole figure for a scene: BEFORE tables (written order) → query → diagram → AFTER table → legend
function illFigHTML(sc, L, run) {
  const ins = (sc.ins || []).map(x => x.raw ? '<div class="ill-t"><div class="ill-role">' + (x.role || 'Input') + '</div><pre class="qy raw">' + _h(x.raw) + '</pre></div>' : illTable(illTab(L, x), x.m, { role: x.role }));
  const used = new Set(); (sc.ins || []).forEach(x => (x.m || []).forEach(k => used.add(k))); ((sc.out && sc.out.m) || []).forEach(k => used.add(k)); (sc.after || []).forEach(x => (x.m || []).forEach(k => used.add(k)));
  const lg = Object.assign({}, ILL_LG, sc.lg || {}); const lgs = []; ['m', 'u', 'x', 'd', 'n'].forEach(k => { if (used.has(k)) lgs.push('<span class="lg mk-' + k + '">' + lg[k] + '</span>'); });
  if ([...used].some(k => /^g/.test(k))) lgs.push('<span class="lg">' + lg.g + '</span>');
  let fig = '';
  if (/^venn-/.test(sc.fig || '')) { const a = illTab(L, sc.ins[0]), b = illTab(L, sc.ins[1]); fig = vennSVG(sc.fig.slice(5), a.n, b.n, sc.vl); }
  else if (sc.fig === 'lr') fig = lrFig(illTab(L, sc.ins[0]).n, illTab(L, sc.ins[1]).n);
  else if (ILL_FIGS[sc.fig]) fig = ILL_FIGS[sc.fig](sc, L);
  else if (sc.fig === 'flow') fig = flowFig((sc.ins || []).map(x => ({ rows: x.raw ? 1 : illTab(L, x).r.length, m: x.m })), sc.out);
  const outH = !sc.out ? '' : sc.out.err ? '<div class="ill-t"><div class="ill-role">After</div><div class="ill-err">✕ Error: ' + _h(sc.out.err) + '</div></div>'
    : illTable({ n: 'result', c: sc.out.c, r: sc.out.r }, sc.out.m, { role: 'After: the result', nc: sc.out.nc, name: false }) + '<div class="muted small">' + sc.out.r.length + ' row' + (sc.out.r.length === 1 ? '' : 's') + (sc.out.nc && sc.out.nc.length ? ' · <span class="newc-k">highlighted column</span> = added by the query' : '') + '</div>';
  const aft = sc.after ? '<div class="ill-ins' + (sc.after.length === 2 ? ' two' : '') + '">' + sc.after.map(x => illTable(illTab(L, x), x.m, { role: x.role })).join('') + '</div>' : '';
  let n = 0; const stp = t => '<div class="ill-step">' + (++n) + ' · ' + t + '</div>';
  return '<div class="ill">' + (ins.length ? stp('Before') + '<div class="ill-ins' + (ins.length === 2 ? ' two' : '') + '">' + ins.join('') + '</div>' : '') +
    (sc.sql || sc.code ? stp(sc.sql ? 'Query' : 'Code') + QY(sc.sql || sc.code) : '') +
    (fig ? '<div class="ill-fig">' + fig + '</div>' : '') +
    (outH || aft ? stp('After') + outH + aft : '') +
    (lgs.length ? '<div class="ill-lg">' + lgs.join('') + '</div>' : '') +
    (run ? '<div class="ill-run"><div class="lab">▶ Run in the app (real SQLite on these tables)</div>' + run + '</div>' : '') + '</div>';
}

/* ---------- illustration state (additive: T.vis in deLearn.terms) ---------- */
function visState(lid) { if (!T.vis || typeof T.vis !== 'object') T.vis = {}; return T.vis[lid] || (T.vis[lid] = { seen: null, q: {} }); }
function visSeen(lid) { return !ILLUS[lid] || !!(T.vis && T.vis[lid] && T.vis[lid].seen); }
// illustration scenes + visual questions for one lesson, in teaching order
function illusSteps(lid, maxQ) {
  const L = ILLUS[lid]; if (!L) return [];
  const s = L.scenes.map((_, i) => ({ type: 'illus', lesson: lid, sc: i }));
  const q = L.qs.map((_, i) => ({ type: 'vq', lesson: lid, qi: i })).slice(0, maxQ == null ? 99 : maxQ);
  return s.concat(q);
}
// existing learners: one lesson a day whose illustration they have not seen yet (theory read or placed),
// lessons with terms already in progress first, then curriculum order
function catchUpIllus() {
  const cands = []; orderedReadyModules().forEach(m => m.lessons.forEach(l => { if (ILLUS[l.id] && !visSeen(l.id) && S.theory[l.id]) cands.push(l); }));
  const busy = l => l.itemIds.some(id => T.terms[id] && T.terms[id].st !== 'done');
  return cands.find(busy) || cands[0] || null;
}
async function runIll(sql, lid) {
  const SQL = await getSQL(); const db = new SQL.Database();
  try { db.exec(illSetupSQL(ILLUS[lid])); const r = db.exec(sql); return r.length ? r[r.length - 1] : { columns: [], values: [] }; } finally { db.close(); }
}
function illSetupSQL(L) {
  const lit = v => v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
  return Object.values(L.tables).map(t => (t.ddl || 'CREATE TABLE ' + t.n + ' (' + t.c.join(', ') + ');') + (t.r.length ? '\nINSERT INTO ' + t.n + ' VALUES ' + t.r.map(r => '(' + r.map(lit).join(', ') + ')').join(', ') + ';' : '')).join('\n');
}
function viewIllus(step) {
  const L = ILLUS[step.lesson], sc = L.scenes[step.sc], l = LESSONS[step.lesson];
  if (!F || F.stepIndex !== SESSION.i) F = { stepIndex: SESSION.i, illus: true, run: null };
  const run = sc.sql && !sc.norun ? (F.run || '<button class="btn" data-act="illRun">▶ Run this query</button>') : '';
  return '<div class="kicker">🔍 See it first · ' + _h(l.title) + ' · picture ' + (step.sc + 1) + '/' + L.scenes.length + '</div><h2>' + _h(sc.h) + '</h2>' +
    (sc.say ? '<p>' + sc.say + '</p>' : '') + illFigHTML(sc, L, run) + (sc.note ? '<p class="muted small">' + sc.note + '</p>' : '') +
    '<div class="actions"><button class="btn primary big" data-act="illNext" data-autofocus>' + (step.sc + 1 < L.scenes.length ? 'Next picture →' : 'Got it → questions') + '</button></div>';
}
function initVQ(step) {
  const q = ILLUS[step.lesson].qs[step.qi];
  const f = { stepIndex: SESSION.i, vq: true, q, sel: [], done: false, ok: null, vals: [] };
  if (q.k === 'mc') f.opts = shuffle(q.o.map((x, i) => ({ x, i })));
  if (q.k === 'run') f.code = q.code;
  if (q.k === 'cls') f.vals = q.items.map(() => null);
  return f;
}
function viewVQ(step) {
  const L = ILLUS[step.lesson], l = LESSONS[step.lesson];
  if (!F || F.stepIndex !== SESSION.i) F = initVQ(step);
  const f = F, q = f.q; let h = '<div class="kicker">🔍 Picture question · ' + _h(l.title) + '</div><h2 class="q">' + q.q + '</h2>';
  const tabs = Object.values(L.tables); if (q.k !== 'tap' && q.k !== 'tapc' && tabs.length) h += '<details class="ill-ref"' + (q.k === 'run' ? ' open' : '') + '><summary>Show the tables</summary><div class="ill-ins">' + tabs.map(t => illTable(t, null, {})).join('') + '</div></details>';
  if (q.sql) h += QY(q.sql);
  if (q.k === 'tap') {
    const others = tabs.filter(t => t.n !== q.t);
    if (others.length) h += '<div class="ill-ins dim">' + others.map(t => illTable(t, null, {})).join('') + '</div>';
    h += illTable(L.tables[q.t], null, { tap: { sel: f.sel, done: f.done, ans: q.ans }, role: 'Tap rows to select them' });
    if (!f.done) h += '<div class="actions"><button class="btn primary big" data-act="vqCheck">✓ Check</button></div>';
  } else if (q.k === 'tapc') {
    const others = tabs.filter(t => t.n !== q.t);
    if (others.length) h += '<div class="ill-ins dim">' + others.map(t => illTable(t, null, {})).join('') + '</div>';
    h += illTable(L.tables[q.t], null, { tapc: { sel: f.sel, done: f.done, ans: q.ans }, role: 'Tap a column header' });
    if (!f.done) h += '<div class="actions"><button class="btn primary big" data-act="vqCheck">✓ Check</button></div>';
  } else if (q.k === 'cls') {
    h += '<div class="cls">' + q.items.map((it, i) => '<div class="cls-i' + (f.done ? (f.vals[i] === it[1] ? ' good' : ' wrong') : '') + '"><div class="cls-q">' + it[0] + '</div><div class="cls-b">' +
      q.cats.map((c, k) => '<button class="chipb' + (f.vals[i] === k ? ' on' : '') + (f.done && k === it[1] ? ' ans' : '') + '" data-act="vqCls" data-i="' + i + '" data-c="' + k + '"' + (f.done ? ' disabled' : '') + ' aria-pressed="' + (f.vals[i] === k) + '">' + c + '</button>').join('') + '</div></div>').join('') + '</div>';
    if (!f.done) h += '<div class="actions"><button class="btn primary big" data-act="vqCheck">✓ Check</button></div>';
  } else if (q.k === 'mc') {
    h += '<div class="opts">' + f.opts.map((o, k) => '<button class="opt' + (f.done ? (o.i === 0 ? ' ok' : f.pick === k ? ' bad' : '') : '') + '" data-act="vqPick" data-k="' + k + '"' + (f.done ? ' disabled' : '') + '>' + o.x + '</button>').join('') + '</div>';
  } else if (q.k === 'run') {
    h += '<textarea id="vqCode" class="mono editor" rows="6" spellcheck="false" autocapitalize="off"' + (f.done ? ' readonly' : '') + '>' + esc(f.code) + '</textarea>' +
      (f.out ? '<div class="out">' + f.out + '</div>' : '') +
      (!f.done ? '<div class="actions three"><button class="btn" data-act="vqRun">▶ Run</button><button class="btn primary" data-act="vqCheck">✓ Check</button></div>' : '');
  }
  if (!f.done) h += '<button class="btn ghost" data-act="vqIdk">I don\'t know: show me</button>';
  else h += '<div class="feedback ' + (f.ok ? 'good' : 'badfb') + '">' + (f.ok ? '✅ Correct' : '↩️ Not quite. You\'ll see it again.' + (f.msg ? ' ' + esc(f.msg) : '')) + '</div><div class="hintbox">💡 ' + q.why + '</div>' +
    (q.k === 'run' && !f.ok ? '<div class="lab">A correct query</div>' + QY(q.sol) : '') +
    '<div class="actions"><button class="btn primary big" data-act="next" data-autofocus>Continue</button></div>';
  return h;
}
function finishVQ(ok, msg) {
  const step = SESSION.steps[SESSION.i]; const vs = visState(step.lesson); const t = today();
  const r = vs.q[step.qi] || (vs.q[step.qi] = { n: 0, ok: null, miss: null }); r.n++; if (ok) r.ok = t; else r.miss = t;
  F.done = true; F.ok = ok; F.msg = msg || '';
  if (ok) { SESSION.stats.right++; addXP(5); } else { SESSION.stats.wrong++; const key = 'vq' + step.lesson + step.qi; if (!step.retry && !SESSION.requeued[key]) { SESSION.requeued[key] = true; SESSION.steps.push(Object.assign({}, step, { retry: true })); } }
  saveTerms(); save();
}


const GROUND = {
  row: { name: 'row', tip: 'one line of a table: one record',
    teach: 'A <b>row</b> is one line across a table. It holds one record, here one song with its title, artist and streams.' + SCENE,
    qs: [{ q: 'Tap <b>one row</b> of the songs table.', show: SC_SONGS, tap: [['title: Rush · Calm Down · Essence', 0], ['Rush · Ayra Starr · 900', 1], ['streams: 900 · 1200 · 700', 0]], why: 'A row runs across: one song with all its values. A list down one field is a column.' },
      { q: 'How many rows does the songs table have?', show: SC_SONGS, o: ['3', '4', '2', '9'], why: 'The top line holds the column names (the header), so it is not a row. The 3 lines below are rows.' }] },
  column: { name: 'column', tip: 'one named field, read downwards',
    teach: 'A <b>column</b> is one named field that every row has, such as <code>streams</code>. You read it downwards.' + SCENE,
    qs: [{ q: 'Tap the <b>column</b> <code>artist</code>.', show: SC_SONGS, tap: [['Ayra Starr · Rema · Wizkid', 1], ['Calm Down · Rema · 1200', 0], ['the whole songs table', 0]], why: 'A column is one field read downwards: all the artists.' },
      { q: 'songs has how many columns?', show: SC_SONGS, o: ['3', '4', '1', '9'], why: 'title, artist and streams: 3 named fields.' }] },
  value: { name: 'value', tip: 'one cell: one piece of data',
    teach: 'A <b>value</b> is one cell: where one row meets one column, e.g. Rush\u2019s streams = 900.' + SCENE,
    qs: [{ q: 'Tap <b>a single value</b>.', show: SC_SONGS, tap: [['900', 1], ['Rush · Ayra Starr · 900', 0], ['streams: 900 · 1200 · 700', 0]], why: 'A value is one cell. A row or a column holds several values.' },
      { q: 'What is the value of streams for Calm Down?', show: SC_SONGS, o: ['1200', 'Rema', 'streams', '3'], why: 'Find the row (Calm Down), then the column (streams): 1200.' }] },
  table: { name: 'table', tip: 'stored rows and columns with a name',
    teach: 'A <b>table</b> is stored data with a name (<code>songs</code>): rows and columns that stay in the database after the query finishes.' + SCENE,
    qs: [{ q: 'Tap the <b>stored table</b> the query reads from.', tap: [[QY(SC_Q), 0], [SC_SONGS, 1], ['the word doubled', 0]], why: 'The query is the instruction. songs is the stored table it reads.' },
      { q: 'In <code>FROM songs</code>, what is songs?', o: ['a table', 'a column', 'a row', 'a value'], why: 'FROM names the table the rows come from.' }] },
  query: { name: 'query', tip: 'an instruction that asks the database for data',
    teach: 'A <b>query</b> is an instruction you send to the database, usually starting with SELECT. It asks for data; it does not store any.' + SCENE,
    qs: [{ q: 'Which of these is a <b>query</b>?', o: ['SELECT title FROM songs;', 'songs', 'streams > 800', 'Calm Down'], why: 'A query is a full instruction (SELECT … FROM …). The others are a table name, a condition and a value.' },
      { q: 'Tap the <b>query</b>.', tap: [[SC_SONGS, 0], [QY(SC_Q), 1], [SC_RES, 0]], why: 'The query is the text instruction; the tables are data.' }] },
  result: { name: 'result rows', tip: 'the rows a query returns, not the stored table',
    teach: 'The <b>result</b> (the <b>result rows</b>) is what a query returns. It is new output. The stored table is not changed: songs still has 3 rows after this query.' + SCENE,
    qs: [{ q: 'Tap the <b>result rows</b>.', tap: [[LAB('Table songs', SC_SONGS), 0], [QY(SC_Q), 0], [LAB('Output', SC_RES), 1]], why: 'The result is the output the query produced. The songs table is the input.' },
      { q: 'Why do we say ORDER BY sorts the <b>result rows</b>, not the table rows?', o: ['The query returns new rows; the stored table is never reordered', 'Because tables have no rows', 'Because ORDER BY deletes the table rows', 'Because the table is sorted first and then copied'], why: 'Queries read tables and return results. Sorting, filtering and limiting all shape the result only.' }] },
  expression: { name: 'expression', tip: 'anything that produces a value for each row',
    teach: 'An <b>expression</b> is anything that produces a value for each row: a column (<code>streams</code>), a calculation (<code>streams * 2</code>) or a function call (<code>UPPER(title)</code>). A table name is not an expression.' + SCENE,
    qs: [{ q: 'Tap the expression that <b>calculates</b> a new value.', inline: true, tap: [['SELECT ', null], ['title', 0], [', ', null], ['streams * 2', 1], [' AS doubled FROM ', null], ['songs', 0], [';', null]], why: 'streams * 2 computes a value for each row. title is a plain column; songs is a table.' },
      { q: 'Which of these can be <b>expressions</b>: price, price * qty, the table name orders?', o: ['price and price * qty', 'only price * qty', 'price, price * qty and orders', 'only orders'], why: 'A column is the simplest expression (it gives a value per row). A table name gives no value, so it is not one.' }] },
  condition: { name: 'condition', tip: 'a test that is TRUE or FALSE for each row',
    teach: 'A <b>condition</b> is a test such as <code>streams &gt; 800</code>. It is checked for each row and gives TRUE or FALSE (or UNKNOWN with NULL).' + illFigHTML(ILL_COND, null),
    qs: [{ q: 'Tap the <b>condition</b>.', inline: true, tap: [['SELECT ', null], ['title', 0], [' FROM ', null], ['songs', 0], [' WHERE ', null], ['streams > 800', 1], [' ORDER BY ', null], ['streams DESC', 0]], why: 'streams > 800 is the test; WHERE uses it to keep rows.' },
      { q: 'For the row Essence (700 streams), what is <code>streams &gt; 800</code>?', show: SC_SONGS, o: ['FALSE', 'TRUE', 'UNKNOWN', '700'], why: '700 is not greater than 800, so the test is FALSE for that row and WHERE drops it.' }] },
  clause: { name: 'clause', tip: 'one part of a query that starts with a keyword',
    teach: 'A <b>clause</b> is one part of a query that starts with a keyword: <code>SELECT …</code>, <code>FROM …</code>, <code>WHERE …</code>, <code>ORDER BY …</code>.' + SCENE,
    qs: [{ q: 'Tap the <b>WHERE clause</b>.', inline: true, tap: [['SELECT title', 0], [' ', null], ['FROM songs', 0], [' ', null], ['WHERE streams > 800', 1], [' ', null], ['ORDER BY streams DESC', 0]], why: 'A clause is the keyword plus its part: WHERE streams > 800.' },
      { q: 'Which of these is a whole <b>clause</b>?', o: ['ORDER BY streams DESC', 'DESC', 'streams', '>'], why: 'A clause starts with its keyword and includes its part. DESC, streams and > are only pieces of clauses.' }] },
  key: { name: 'key', tip: 'a column whose values identify rows',
    teach: '<b>Key</b> columns identify rows. <code>artists.artist_id</code> gives every artist a unique number; <code>songs.artist_id</code> uses that number to point at an artist.' + '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>',
    qs: [{ q: 'Which column identifies each artist?', show: '<div class="scene">' + LAB('artists', SC_ART) + '</div>', o: ['artist_id', 'name (names can repeat)', 'genre', 'the first row'], why: 'artist_id is unique per artist and never missing. Names and genres can repeat.' },
      { q: 'In songs, which column points to an artist?', show: '<div class="scene">' + LAB('songs', SC_SNG) + '</div>', o: ['artist_id', 'song_id', 'title', 'none'], why: 'songs.artist_id holds artists\u2019 key values, linking each song to one artist.' }] },
  datatype: { name: 'data type', tip: 'what kind of value a column holds',
    teach: 'A <b>data type</b> says what kind of value a column holds: INTEGER (whole numbers), TEXT, DATE, BOOLEAN …',
    qs: [{ q: 'streams holds 900, 1200, 700. Its data type is…', show: SC_SONGS, o: ['INTEGER (whole numbers)', 'TEXT', 'DATE', 'BOOLEAN'], why: 'Whole numbers are INTEGER.' },
      { q: 'Which value is TEXT?', o: ["'Rush'", '900', 'TRUE', '2.5'], why: 'Text values are written in quotes in SQL.' }] },
  schema: { name: 'schema', tip: 'the structure, not the data',
    teach: 'The <b>schema</b> is the structure: which tables exist, their columns and data types. The rows are the data that fill that structure.',
    qs: [{ q: 'Which of these is part of the <b>schema</b>, not the data?', o: ['streams is an INTEGER column of songs', 'Rush has 900 streams', 'there are 3 songs today', 'Rema is an artist'], why: 'Column names and types are structure. The others are facts stored as data.' },
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
    teach: 'A table split by a column (e.g. <code>chart_date</code>) has one <b>partition</b> per value: all rows of 10-16, all rows of 10-17 …' + SC_CHART,
    qs: [{ q: 'The table is split by chart_date. Which rows form one partition?', show: SC_CHART, o: ['all rows with chart_date 10-17', 'the first row', 'the streams column', 'every row in the table'], why: 'One partition = all rows that share one value of the split column.' },
      { q: 'Reloading only today\u2019s partition means…', o: ['only today\u2019s rows are replaced; other days are untouched', 'the whole table is replaced', 'a new column is added', 'today\u2019s rows are duplicated'], why: 'Partitions let a job touch only the part it needs.' }] },
  entity: { name: 'entity', tip: 'a thing that exists on its own, with its own table and ID',
    teach: 'An <b>entity</b> is a thing that exists on its own and that we store facts about: an artist, a song, a listener. Each one gets its own table, one row per thing, with its own ID.' + '<div class="scene">' + LAB('artists (an entity table)', MT(['artist_id', 'name'], [[1, 'Burna Boy'], [2, 'Tems']])) + '</div>',
    qs: [{ q: 'Which is an <b>entity</b>?', o: ['a song', 'a song\u2019s chart position today', 'a play at 21:14', '"song belongs to artist"'], why: 'A song exists on its own. A chart position is a changing fact (state), a play is an event, and "belongs to" is a relationship.' },
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

const SC_GENRE = MT(['name', 'genre'], [['Burna Boy', 'Afrobeats'], ['Tems', null], ['Rema', 'Afrobeats']]);
const TERMS4 = {
  // ---- v7: entities, state, events, relationships, many-to-many
  'sqlr-t1': { t1: { def: 'An entity is {a thing that exists on its own} {that we store facts about}, {with its own table and ID}.', ph: [
    { a: ['something that exists by itself', 'a thing that exists independently'], d: [['a thing that only exists when something happens', 'That is an event. An entity (an artist) exists whether or not anything happens.'], ['a column that changes over time', 'That is state: a fact about an entity, not the entity itself.'], ['a link between two tables', 'That is a relationship.']],
      spot: { q: 'Which of these is an <b>entity</b>?', o: ['a listener', 'a stream at 21:14', 'an artist\u2019s current label', '"song belongs to artist"'], why: 'A listener exists on its own. The stream is an event, the label is state, and "belongs to" is a relationship.' } },
    { a: ['that we keep facts about', 'that we record facts about'], d: [['that we delete facts about', 'We store facts about it. Deleting is not the point.'], ['that we store queries about', 'We store facts (data), not queries.'], ['that stores no facts', 'An entity is exactly what the facts (columns) describe.']],
      spot: { q: 'In <code>artists(artist_id, name, label)</code>, what are name and label?', o: ['facts about the artist entity', 'other entities', 'events', 'relationships'], why: 'Columns hold facts about the entity the row stands for.' } },
    { a: ['with its own table and primary key', 'with its own table and its own ID'], d: [['with its own column and ID', 'An entity gets a whole table. One column is just a fact.'], ['sharing a table with every other entity', 'Each entity has its own table, so each fact is stored once.'], ['with its own table but no ID', 'The ID (primary key) is how other tables point at it.']],
      spot: { q: 'Listeners are a new entity. What do you create?', o: ['a listeners table with a listener_id primary key', 'a listener column in songs', 'a new row in artists', 'nothing: listeners are events'], why: 'A new entity gets its own table and its own ID.' } }] } },
  'sqlr-t2': { t1: { def: 'State is {a current fact about an entity that can change}; {an UPDATE overwrites the old value}.', ph: [
    { a: ['a current, changeable fact about an entity', 'a fact about an entity that can change'], d: [['a fact about an entity that never changes', 'State changes: labels, chart positions, cities.'], ['something that happened at a moment', 'That is an event: recorded once and never changed.'], ['a thing that exists on its own', 'That is an entity. State is a fact ABOUT an entity.']],
      spot: { q: 'Which is <b>state</b>?', o: ['Calm Down is #1 on today\u2019s chart', 'Ada streamed Calm Down at 21:14', 'Rema (an artist)', 'songs.artist_id points at artists'], why: 'Chart position is a current fact that will change. The stream is an event, Rema is an entity, and the pointer is a relationship.' } },
    { a: ['an UPDATE replaces the old value', 'updating overwrites the previous value'], d: [['an UPDATE adds a new row', 'Adding a new row each time is how events are stored. UPDATE changes the existing row.'], ['an UPDATE keeps the old value automatically', 'The old value is lost unless you keep history on purpose.'], ['an INSERT overwrites the old value', 'INSERT adds rows. UPDATE overwrites values.']],
      spot: { q: 'Burna Boy moves from Spaceship to Atlantic and we run <code>UPDATE artists SET label = \'Atlantic\' WHERE artist_id = 1</code>. Where is "Spaceship" now?', o: ['gone, unless we kept history on purpose', 'in a second row for Burna Boy', 'in the streams table', 'still in the label column'], why: 'UPDATE overwrites. To keep the old value you need a history table (or a slowly changing dimension).' } }] } },
  'sqlr-t3': { t1: { def: 'An event is {something that happened at a moment}; {it is stored as a new row with a timestamp} {and never changes}.', ph: [
    { a: ['something that happened at a point in time', 'an occurrence at a specific moment'], d: [['something that exists on its own', 'That is an entity.'], ['a current fact that can change', 'That is state.'], ['something that will happen later', 'Events are recorded after they happen.']],
      spot: { q: 'Which is an <b>event</b>?', o: ['Ada streamed Last Last at 21:14', 'Ada (a listener)', 'Last Last\u2019s current chart position', 'Last Last belongs to Burna Boy'], why: 'Only the stream happened at a moment.' } },
    { a: ['each one is a new row with a timestamp', 'it is recorded as a new row with its time'], d: [['it is stored by updating a row', 'Events add rows. Updating would erase the earlier event.'], ['it is stored as a new column', 'Each event is a row, not a column.'], ['it is stored as a new table', 'There is one events table with one row per event.']],
      spot: { q: 'Ada streams Last Last again tomorrow. What happens in <code>streams</code>?', show: MT(['stream_id', 'listener_id', 'song_id', 'streamed_at'], [[1, 100, 10, '21:14']]), o: ['a new row is added', 'row 1 is updated with the new time', 'nothing: she already streamed it', 'a new column is added'], why: 'Every play is a new event row, and old events are never changed.' } },
    { a: ['and is never updated', 'and is not changed afterwards'], d: [['and is updated when facts change', 'That describes state. An event stays as it happened.'], ['and is deleted after a day', 'Events are kept: they are the history.'], ['and changes when the entity changes', 'The event records what happened then. It does not follow later changes.']],
      spot: { q: 'Tems changes her label next year. What happens to this year\u2019s stream rows for her songs?', o: ['nothing: past events stay as they were', 'they are updated to the new label', 'they are deleted', 'they move to a new table'], why: 'Events record what happened at that moment and do not change.' } }] } },
  'sqlr-t4': { t1: { def: 'A relationship is {how entities connect}: {a fixed fact stored as a foreign key}, {or a link created by an event}.', ph: [
    { a: ['how entities are connected', 'the way entities link to each other'], d: [['how columns are sorted', 'Sorting is ORDER BY.'], ['how one entity changes over time', 'That is state changing.'], ['how tables are stored on disk', 'Storage is not the logical link.']],
      spot: { q: 'Which is a <b>relationship</b>?', o: ['Last Last belongs to Burna Boy', 'Burna Boy (an artist)', 'Burna Boy\u2019s current label', 'a stream at 21:14'], why: '"Belongs to" connects two entities. The others are an entity, state and an event.' } },
    { a: ['a fixed fact stored in a foreign key', 'a permanent link held by a foreign key'], d: [['a fixed fact stored in a primary key', 'The primary key identifies the row itself. The link is the foreign key that points at another table.'], ['a fixed fact stored in a comment', 'It is stored as data, in a foreign key column.'], ['a fixed fact copied into every column', 'It is stored once, in one foreign key column.']],
      spot: { q: 'Where is "song belongs to artist" stored?', show: MT(['song_id', 'title', 'artist_id'], [[10, 'Last Last', 1], [11, 'Free Mind', 2]]), o: ['songs.artist_id', 'songs.song_id', 'songs.title', 'nowhere'], why: 'The foreign key column songs.artist_id stores which artist each song belongs to.' } },
    { a: ['or a link that an event creates', 'or a connection made by events'], d: [['or a link that exists before anything happens', 'Listener–song links do not exist until a stream happens.'], ['or a link created by a query', 'Queries read links. They do not create them in the data.'], ['or a link created by sorting', 'Sorting creates nothing.']],
      spot: { q: 'Zainab has never streamed anything. How is she related to songs?', o: ['not at all yet: the link appears when a stream event is stored', 'through listeners.song_id', 'through artists', 'every listener is linked to every song'], why: 'Listener–song links are created by events. No stream row means no link.' } }] } },
  'sqlr-t5': { t1: { def: 'One-to-many means {one row on one side matches many rows on the other}; {the foreign key sits on the many side}.', ph: [
    { a: ['one row relates to many rows in the other table', 'one row on one side links to many on the other'], d: [['many rows on each side match many on the other', 'That is many-to-many.'], ['one row matches exactly one row', 'That is one-to-one.'], ['one column matches many columns', 'Relationships are between rows, not columns.']],
      spot: { q: 'An artist has many songs, and each song has one artist. Which relationship is that?', o: ['one-to-many', 'one-to-one', 'many-to-many', 'no relationship'], why: 'One artist row → many song rows.' } },
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
      spot: { q: 'Tap the <b>table</b>.', tap: [[QY('SELECT title FROM songs;'), 0], [SC_SONGS, 1], ['Rush', 0]], why: 'The table is the stored grid of rows and columns. The query only reads it; Rush is one value.' } },
    { a: ['every row is one record', 'each row holds one record'], d: [['each column is one record', 'A column is one field (like streams). A record runs across a row.'], ['each row is one table', 'A row is one record inside the table.'], ['each row is many records', 'One row = one record, e.g. one song.']],
      spot: { q: 'In songs, what does <b>one row</b> represent?', show: SC_SONGS, o: ['one song', 'all songs by one artist', 'every song', 'one column of streams'], why: 'Each row is one record: here, one song.' } }] } },
  'sql1-t2': { t1: { def: 'A primary key is {a column or set of columns} {that uniquely identifies each row}; {it can never be NULL}.', ph: [
    { a: ['one or more columns', 'a column or a group of columns'], d: [['a single row', 'A key is made of columns; rows are what it identifies.'], ['exactly one column', 'It can be several columns together (a composite key), e.g. (chart_date, track_id).'], ['a separate table', 'The key is columns inside the table itself.']],
      spot: { q: 'chart_entries has one row per song per day, identified by (chart_date, song_id). What is (chart_date, song_id)?', o: ['a set of columns used as the primary key', 'two separate primary keys', 'one row', 'a foreign key'], why: 'Two columns together can form one primary key (a composite key).' } },
    { a: ['that identifies each row uniquely', 'whose value is unique for each row'], d: [['that uniquely identifies one row', 'It identifies EACH row: every row gets its own unique value, not just one row.'], ['that uniquely identifies each column', 'A key picks out rows, not columns.'], ['that sorts each row', 'Keys identify rows; sorting is ORDER BY.']],
      spot: { q: 'Which column could be the primary key of songs?', show: SC_SNG, o: ['song_id', 'artist_id (3 appears twice)', 'title', 'the whole table'], why: 'song_id is different on every row. artist_id repeats, so it cannot identify each row.' } },
    { a: ['it is never NULL', 'it cannot be NULL'], d: [['it can sometimes be NULL', 'A missing key means a row you cannot identify, so NULL is never allowed.'], ['it can never be zero', '0 is a real value. The rule is about NULL (missing).'], ['it can never repeat in other tables', 'Repeating in other tables is fine (that is a foreign key). The rule here is: never NULL.']] }] } },
  'sql1-t3': { t1: { def: 'A foreign key is {a column that points to the primary key} {of another table}.', ph: [
    { a: ['a column that references the primary key', 'a column holding primary key values'], d: [['a column that points to any column', 'It points to the other table\u2019s PRIMARY key, so each value matches exactly one row there.'], ['a row that points to the primary key', 'A foreign key is a column, filled in on every row.'], ['a column that replaces the primary key', 'It replaces nothing; it refers to a key elsewhere.']],
      spot: { q: 'Which column is the <b>foreign key</b>?', show: '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>', o: ['songs.artist_id', 'songs.song_id', 'artists.artist_id', 'songs.title'], why: 'songs.artist_id holds values of artists\u2019 primary key. artists.artist_id is the primary key it points to.' } },
    { a: ['in another table', 'of a different table'], d: [['of the same column', 'It links to a key in another table.'], ['of every table', 'It points to one specific table.'], ['of another database', 'Usually another table in the same database.']],
      spot: { q: 'A song has artist_id = 3. Where do you look to find who that is?', show: '<div class="scene">' + LAB('artists', SC_ART) + LAB('songs', SC_SNG) + '</div>', o: ['the artists row whose artist_id is 3', 'the songs row whose song_id is 3', 'the 3rd row of songs', 'nowhere: 3 is just a number'], why: 'The foreign key value is looked up in the other table\u2019s primary key: artist 3 is Rema.' } }] } },
  'sql1-t5': { t1: { def: 'A schema is {the structure of a database}: {its tables, columns and data types}.', ph: [
    { a: ['the design of a database', 'the layout of a database'], d: [['the data in a database', 'The schema is the shape (tables, columns, types), not the rows of data.'], ['the speed of a database', 'Speed is performance, not structure.'], ['a copy of a database', 'A copy is a backup.']],
      spot: { q: 'Which of these is part of the <b>schema</b>?', o: ['the songs table has an INTEGER column streams', 'Rush has 900 streams', 'there are 3 songs', 'Rema sang Calm Down'], why: 'Tables, columns and types are structure; the rest are data.' } },
    { a: ['tables, columns and data types', 'its tables, columns and types'], d: [['its rows and values', 'Rows and values are the data; the schema describes their structure.'], ['its tables only', 'Columns and data types are part of the structure too.'], ['its queries and results', 'Queries read data; they are not the structure.']],
      spot: { q: 'Someone changes streams from TEXT to INTEGER. What changed?', o: ['the schema (a data type)', 'only the data', 'nothing', 'a query result'], why: 'Data types are part of the schema.' } }] } },
  'sql2-t1': { t1: { def: 'A predicate is {a condition that is TRUE, FALSE or UNKNOWN} {for each row}; {WHERE keeps only the rows where it is TRUE}.', ph: [
    { a: ['a condition that evaluates to TRUE, FALSE or UNKNOWN', 'a test that is TRUE, FALSE or UNKNOWN'], d: [['a condition that is TRUE or FALSE', 'SQL has a third result, UNKNOWN, when NULL is involved.'], ['a value that is TRUE, FALSE or UNKNOWN', 'A predicate is a test like streams > 800, not a stored value.'], ['a column that is TRUE, FALSE or UNKNOWN', 'The predicate is the test, not a column.']],
      spot: { q: 'Tap the <b>predicate</b>.', inline: true, tap: [['SELECT ', null], ['title', 0], [' FROM ', null], ['songs', 0], [' WHERE ', null], ['streams > 800', 1], [';', null]], why: 'streams > 800 is the condition WHERE checks.' } },
    { a: ['for every row', 'checked on each row'], d: [['for one row', 'WHERE checks each row; "one row" would mean only a single row is checked.'], ['for each column', 'The condition is checked row by row, not column by column.'], ['for the whole table at once', 'It gives one answer per row, not one answer for the table.']],
      spot: { q: '<code>WHERE streams &gt; 800</code> on songs. How many times is the condition checked?', show: SC_SONGS, o: ['3, once per row', '1, once for the table', '2, once per kept row', '9, once per value'], why: 'The predicate is evaluated for each row; rows where it is TRUE are kept.' } },
    { a: ['WHERE keeps the rows where it is TRUE', 'WHERE returns only rows where it is TRUE'], d: [['WHERE keeps the rows where it is not FALSE', 'UNKNOWN rows are dropped too: only TRUE survives.'], ['WHERE keeps all rows and marks the TRUE ones', 'WHERE removes rows; it does not mark them.'], ['WHERE keeps only the rows where it is FALSE', 'Kept rows are the TRUE ones.']],
      spot: { q: "<code>WHERE genre = 'Afrobeats'</code>. Which rows are kept?", show: SC_GENRE, o: ['Burna Boy and Rema', 'Burna Boy, Tems and Rema', 'only Tems', 'none'], why: 'Tems has NULL, so the test is UNKNOWN, and only TRUE rows are kept.' } }] } },
  'sql2-t2': { t1: { def: 'NULL is {a marker for a missing or unknown value}; {it is not zero and not an empty string}.', ph: [
    { a: ['a marker meaning a value is missing or unknown', 'a marker for a missing value'], d: [['a value of zero', 'NULL is not 0. Zero is a real, known number.'], ['a marker for a deleted row', 'A NULL is one missing value in a row, not a deleted row.'], ['a marker for a wrong value', 'Wrong data is still a value; NULL means there is no value.']],
      spot: { q: 'Which cell is <b>NULL</b>?', show: SC_GENRE, o: ['Tems\u2019 genre', 'Burna Boy\u2019s genre', 'the genre column', 'Rema\u2019s name'], why: 'Tems\u2019 genre is missing (unknown), shown as NULL.' } },
    { a: ['not zero and not an empty string', 'it is neither 0 nor an empty string'], d: [['it is zero or an empty string', 'The classic mistake: NULL is neither.'], ['it is not zero but it is an empty string', "An empty string '' is a known (empty) value; NULL is unknown."], ['it is not missing and not unknown', 'Missing or unknown is exactly what NULL means.']] }] } },
  'sql2-t3': { t1: { def: 'In three-valued logic {conditions can be TRUE, FALSE or UNKNOWN}; {any comparison with NULL gives UNKNOWN}, {so you test for NULL with IS NULL}.', ph: [
    { a: ['a condition can be TRUE, FALSE or UNKNOWN', 'conditions are TRUE, FALSE or UNKNOWN'], d: [['conditions can be TRUE or FALSE', 'The third value, UNKNOWN, is the whole point.'], ['conditions can be TRUE, FALSE or NULL', 'The logic value is called UNKNOWN; NULL is the missing data that causes it.'], ['values can be TRUE, FALSE or UNKNOWN', 'It is about conditions (tests), not stored values.']],
      spot: { q: "For Tems (genre NULL), what is <code>genre = 'Afrobeats'</code>?", show: SC_GENRE, o: ['UNKNOWN', 'FALSE', 'TRUE', 'an error'], why: 'Comparing with a missing value cannot be decided: UNKNOWN.' } },
    { a: ['any comparison with NULL yields UNKNOWN', 'comparing anything with NULL gives UNKNOWN'], d: [['any comparison with NULL gives FALSE', 'It is UNKNOWN, not FALSE. NOT FALSE is TRUE, but NOT UNKNOWN stays UNKNOWN.'], ['some comparisons with NULL give UNKNOWN', 'ANY comparison: =, <>, >, even NULL = NULL.'], ['any comparison with zero gives UNKNOWN', 'Zero is a normal value; the trouble is NULL.']],
      spot: { q: 'What does <code>NULL = NULL</code> return?', o: ['UNKNOWN', 'TRUE', 'FALSE', 'an error'], why: 'Two unknowns cannot be known to be equal: UNKNOWN.' } },
    { a: ['you test for NULL with IS NULL', 'so you check for NULL using IS NULL'], d: [['so you test for NULL with = NULL', '= NULL is a comparison, so it is always UNKNOWN and matches nothing.'], ['so you test for NULL with = 0', 'NULL is not 0; IS NULL is the test.'], ['so you test for NULL with LIKE NULL', 'LIKE is a comparison too, so UNKNOWN.']] }] } },
  'sql3-t1': { t1: { def: 'ORDER BY {sorts the result rows} {by one or more expressions}.', ph: [
    { a: ['sorts the rows of the result', 'orders the result rows'], d: [['sorts the table rows', 'ORDER BY never changes the stored table; it orders the rows the query returns.'], ['filters the result rows', 'It keeps every row; filtering is WHERE.'], ['groups the result rows', 'Grouping is GROUP BY; ORDER BY only changes the order.']],
      spot: { q: 'This query has ORDER BY streams DESC. Tap what it sorts.', tap: [[LAB('Table songs', SC_SONGS), 0], [QY(SC_Q), 0], [LAB('Output', SC_RES), 1]], why: 'It sorts the result rows (the output). The songs table keeps its rows as they are.' } },
    { a: ['by one or more columns or expressions', 'by one or more columns'], d: [['by one expression', '"One or more": ORDER BY artist, streams DESC sorts by two.'], ['on one or more expressions', '"on" belongs to JOIN … ON. ORDER BY sorts BY something.'], ['by one or more tables', 'You sort by values (columns or expressions), not by tables.']],
      spot: { q: 'How many sort expressions are in this ORDER BY?', show: QY('SELECT title FROM songs\nORDER BY artist, streams * 2 DESC;'), o: ['2: artist, then streams * 2', '1: artist', '3', '0'], why: 'Two expressions, separated by a comma. The second only breaks ties of the first.' } }] },
    t3: 'ORDER BY {sorts the final result rows by one or more expressions}, {each ascending by default or DESC}, {with NULLs placed first or last depending on the database}; {without it no row order is guaranteed}.' },
  'sql3-t2': { t1: { def: 'LIMIT {returns only the first N rows} {of the result}.', ph: [
    { a: ['keeps only the first N rows', 'returns just the first N rows'], d: [['returns only the last N rows', 'LIMIT keeps the first N. For the "last" ones, reverse the ORDER BY.'], ['returns N random rows', 'Without ORDER BY the first N are arbitrary, but LIMIT still means "the first N".'], ['returns all rows except N', 'It keeps N; it does not remove N.']],
      spot: { q: 'What does this return?', show: SC_SONGS + QY('SELECT title FROM songs\nORDER BY streams DESC\nLIMIT 1;'), o: ['Calm Down', 'Rush', 'Essence', 'all three titles'], why: 'Sorted by streams, the first row is Calm Down (1200).' } },
    { a: ['of the query result', 'of the result rows'], d: [['of the table', 'LIMIT trims the result after sorting; the table is untouched.'], ['of each group', 'LIMIT applies once to the whole result.'], ['of each column', 'LIMIT counts rows.']],
      spot: { q: 'After <code>SELECT * FROM songs LIMIT 2</code>, how many rows does the songs table have?', o: ['still 3', '2', '1', '0'], why: 'LIMIT only trims the result. The stored table keeps its 3 rows.' } }] } },
  'sql3-t3': { t1: { def: 'DISTINCT {removes duplicate rows} {from the result}.', ph: [
    { a: ['drops duplicate rows', 'removes repeated rows'], d: [['removes duplicate columns', 'It compares whole rows of the result, not columns.'], ['removes NULL rows', 'It targets duplicates; one copy of each row stays, NULLs included.'], ['counts duplicate rows', 'Counting is COUNT; DISTINCT removes.']],
      spot: { q: '<code>SELECT DISTINCT artist FROM chart;</code> How many rows?', show: SC_CHART, o: ['2', '3', '1', '4'], why: 'Rema, Rema, Tems → duplicates removed → Rema, Tems.' } },
    { a: ['from the query result', 'from the result rows'], d: [['from the table', 'Only the result is de-duplicated; the table keeps all rows.'], ['from each column separately', 'It removes rows where ALL selected columns repeat together.'], ['from the database', 'Nothing is deleted from storage.']],
      spot: { q: '<code>SELECT DISTINCT artist, title FROM chart;</code> How many rows?', show: SC_CHART, o: ['2', '3', '1', '4'], why: '(Rema, Calm Down) appears twice → one copy; plus (Tems, Free Mind).' } }] } },
  'sql3-t4': { t1: { def: 'Logical query order is {the order the database evaluates clauses}: {FROM, WHERE, GROUP BY, HAVING}, {then SELECT, ORDER BY, LIMIT}.', ph: [
    { a: ['the order SQL clauses are evaluated', 'the order in which clauses are evaluated'], d: [['the order you write the clauses', 'You write SELECT first, but it is evaluated after FROM, WHERE, GROUP BY and HAVING.'], ['the order of rows in the result', 'That is ORDER BY.'], ['the order tables are created', 'That is DDL.']] },
    { ord: true, a: [], d: [['WHERE, FROM, GROUP BY, HAVING', 'FROM comes first: rows must be read before they can be filtered.'], ['FROM, GROUP BY, WHERE, HAVING', 'WHERE filters rows before grouping; HAVING filters groups after.'], ['FROM, HAVING, GROUP BY, WHERE', 'HAVING needs groups, so it comes after GROUP BY.']],
      spot: { q: 'Why can WHERE not use SUM(streams)?', o: ['WHERE runs before GROUP BY, so no groups or sums exist yet', 'SUM only works in ORDER BY', 'WHERE runs after SELECT', 'SUM needs a JOIN'], why: 'FROM → WHERE → GROUP BY: aggregates appear only after grouping. Filter them with HAVING.' } },
    { ord: true, a: ['then SELECT, then ORDER BY, then LIMIT'], d: [['then ORDER BY, SELECT, LIMIT', 'SELECT comes before ORDER BY; that is why ORDER BY can use a SELECT alias.'], ['then LIMIT, SELECT, ORDER BY', 'LIMIT is last: it keeps the first N rows after sorting.'], ['then SELECT, LIMIT, ORDER BY', 'Sorting must happen before you can take the first N.']],
      spot: { q: 'Why can ORDER BY use the alias <code>doubled</code> from SELECT, but WHERE cannot?', show: QY(SC_Q), o: ['ORDER BY is evaluated after SELECT; WHERE is evaluated before it', 'ORDER BY ignores aliases', 'WHERE runs last', 'aliases only work in LIMIT'], why: '… WHERE … → SELECT (alias created) → ORDER BY (alias exists).' } }] } },
  'sql4-t1': { t1: { def: 'An aggregate function {takes many rows} {and returns one value}, {like COUNT, SUM or AVG}.', ph: [
    { a: ['reads many rows', 'works over many rows'], d: [['takes one row', 'Aggregates combine many rows. A normal function like UPPER works on one row at a time.'], ['takes many tables', 'It combines rows, usually from one result.'], ['takes many columns', 'It combines the values of many ROWS (one column usually).']],
      spot: { q: 'Which is an <b>aggregate</b> function call?', o: ['SUM(streams)', 'UPPER(title)', 'streams * 2', 'ROUND(streams, 0)'], why: 'SUM reads many rows. UPPER and ROUND work on one value per row.' } },
    { a: ['and returns a single value', 'and gives back one value'], d: [['and returns one value per row', 'That is a normal (scalar) function. An aggregate collapses many rows into one value.'], ['and returns many values', 'Many rows in, one value out.'], ['and returns the first value', 'It summarises all of them (count, sum, average…).']],
      spot: { q: '<code>SELECT SUM(streams) FROM songs;</code> returns…', show: SC_SONGS, o: ['one row: 2800', 'three rows', '2800 on each of three rows', '900'], why: '900 + 1200 + 700 = 2800, one value.' } },
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
      spot: { q: '<code>SELECT COUNT(*) FROM artists;</code>', show: SC_GENRE, o: ['3', '2', '1', '0'], why: 'Every row counts, including Tems with a NULL genre.' } },
    { a: ['COUNT(column) counts only the non-NULL values', 'COUNT(column) skips rows where it is NULL'], d: [['COUNT(column) counts all rows', 'It skips NULLs in that column.'], ['COUNT(column) counts only rows where that column is NULL', 'The opposite: it counts the NON-NULL ones.'], ['COUNT(column) counts only distinct values', 'That is COUNT(DISTINCT column).']],
      spot: { q: '<code>SELECT COUNT(genre) FROM artists;</code>', show: SC_GENRE, o: ['2', '3', '1', '0'], why: 'Tems\u2019 genre is NULL, so COUNT(genre) skips it.' } }] } },
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
      spot: { q: 'The chart table is partitioned by chart_date. How many partitions?', show: SC_CHART, o: ['2 (10-16 and 10-17)', '3', '1', '4'], why: 'One partition per date value.' } }] },
    t3: 'A partition is {a physically separate slice of a table keyed by a column such as date}, {which lets jobs overwrite or scan only that slice (partition pruning)} {and makes reruns of one day cheap and idempotent}.' }
};

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
function lessonProgress(l) {
  const ids = l.itemIds; if (!ids || !ids.length) return 0;
  const ip = ids.reduce((a, id) => a + itemProgress(id), 0) / ids.length;
  const ps = l.problems || []; const pp = ps.length ? ps.filter(p => S.problems[p.id] && S.problems[p.id].solved).length / ps.length : 1;
  return ip * 0.85 + pp * 0.15 * (ip > 0 ? 1 : 0);
}
function moduleProgress(m) {
  if (m.status !== 'ready') return 0; const avg = ls => ls.length ? ls.reduce((a, l) => a + lessonProgress(l), 0) / ls.length : 0;
  // v7: lessons added by an update (l.added) can only raise the module %, never lower what learners already had
  const orig = m.lessons.filter(l => !l.added); return Math.max(avg(m.lessons), orig.length < m.lessons.length ? avg(orig) : 0);
}

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
function orderedReadyModules() { const f = S.settings.focus; return READY.slice().sort((a, b) => (b.id === f) - (a.id === f)); }
const codeIds = l => l.itemIds.filter(x => ITEMS[x].kind !== 'term');
// v4: a lesson counts as started from its code/Q&A items only, so slow terms never hold lessons back
function lessonStarted(id) { const l = LESSONS[id]; return !!(l && ((S.theory[id] && codeIds(l).every(x => S.items[x])) || (E && E.placed[id]))); }
function moduleUnlocked(m) { return !m.requires || m.requires.every(lessonStarted); }
function lessonOpen(l) { return !E.placed[l.id] && (!S.theory[l.id] || codeIds(l).some(id => !S.items[id])); }
// v7: a lesson added by an update (l.added) before one the learner already started ("gap" lesson) is offered first, one a day in the normal
// new-lesson slot. It is never locked; fresh learners simply meet it in curriculum order.
function gapLesson() {
  for (const m of orderedReadyModules()) if (moduleUnlocked(m)) { const ls = m.lessons;
    for (let i = 0; i < ls.length; i++) if (ls[i].added && !S.theory[ls[i].id] && lessonOpen(ls[i]) && ls.slice(i + 1).some(x => S.theory[x.id] || E.placed[x.id])) return ls[i]; }
  return null;
}
function nextLesson() {
  const g = gapLesson(); if (g) return g;
  for (const m of orderedReadyModules()) if (moduleUnlocked(m)) for (const l of m.lessons) {
    if (E.placed[l.id]) continue;
    if (!S.theory[l.id] || codeIds(l).some(id => !S.items[id])) return l;
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
/* ---------- v4 session builders ----------
   Daily order: [help once] → opening term block → code flashcards → code/Q&A fade reviews
   → theory → new code/Q&A items → problem → closing term review.
   Code and problems are planned first and never shrink for terms; terms then get
   about half as many items as everything else (= about 1/3 of the session). */
function buildDailySession() {
  const t = today(), budget = S.settings.minutes * 0.8; const other = []; let mins = 0;
  const notTerm = id => ITEMS[id] && ITEMS[id].kind !== 'term';
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
  const cu = illus.length ? null : catchUpIllus(); const cuSteps = cu ? illusSteps(cu.id) : [];
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
  const v = { home: viewHome, session: viewSession, summary: viewSummary, roadmap: viewRoadmap, lesson: viewLesson, cards: viewCards, lab: viewLab, settings: viewSettings, placement: viewPlacement, learn: viewLearn }[UI.screen] || viewHome;
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
  return '<header class="top"><h1>Roadmap</h1><div class="muted small">Aimed at remote entry-level data engineering roles</div></header><main>' + mods + '</main>' + nav('roadmap');
}
function viewLesson() {
  const l = LESSONS[UI.params.l]; if (!l) return viewRoadmap();
  const lp = lessonProgress(l); const lvlTxt = id => { const s = S.items[id]; const ts = T.terms[id]; if (ts && T4[id]) { const n = ts.ph.length, k = ts.ph.filter(p => p.s >= 3).length, pi = activePhrase(ts);
    if (ts.st === 'done') return '<span class="lvlM">🏆 all tiers</span>'; if (ts.st === 'wait') return '<span class="lvlM">🏆 tier ' + ts.tier + ' · next ' + esc(ts.wait) + '</span>';
    if (blocksLeft(id).length && ts.st === 'active') return '<span class="lvlN">🧱 building blocks</span>';
    return '<span class="lvlN">' + (ts.st === 'paused' ? '⏸ ' : '🧩 ') + 'T' + (ts.tier + 1) + ' ' + k + '/' + n + (pi >= 0 && ts.st === 'active' ? ' · ' + FORMS[ts.ph[pi].s] : '') + '</span>'; }
    if (ITEMS[id].kind === 'term' && !s && !S.cards[id]) return '<span class="lvl0">queued</span>';
    if (s && !s.mastered && E.bites[id]) { const b = E.bites[id]; return '<span class="lvlN">🧩 ' + (b.c.l > 0 ? 'combining ' + Math.min(b.c.l, 3) + '/3' : b.p.filter(p => p.l === 3).length + '/' + b.p.length + ' pieces') + '</span>'; } return !s ? (S.cards[id] ? '<span class="lvlM">🃏 card</span>' : '<span class="lvl0">new</span>') : s.mastered ? '<span class="lvlM">🏆 mastered</span>' : '<span class="lvlN">L' + s.lvl + '</span>'; };
  return '<header class="top"><button class="back" data-act="go" data-to="roadmap">‹ Roadmap</button><h1>' + esc(l.title) + '</h1></header><main>' +
    '<section class="card">' + lvBadge(lp) + bar(lp) +
    '<button class="btn primary big" data-act="startLesson" data-l="' + l.id + '">▶ Practise this lesson</button>' +
    '<div class="muted small center">Theory, every item at its current level, a few term steps, then the problems.</div></section>' +
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
    '<p class="muted small center">DE Daily · works offline · v7.0</p></main>' + nav('settings');
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
  const t = today(); const out = Object.keys(T.terms).filter(id => T4[id] && T.terms[id].st === 'wait' && T.terms[id].wait <= t);
  Object.keys(T4).forEach(id => { if (!T.terms[id] && S.items[id] && S.items[id].mastered && T4[id].tiers.length > tiersDoneOld(id) && S.cards[id] && (S.cards[id].added || '') <= addDays(t, -TIER_WAIT_DAYS)) out.push(id); });
  return out;
}
function planTerms(other, theoryLesson) {
  const t = today(), pace = paceInfo4(), day = (T.day && T.day.d === t) ? T.day : { d: t, newTerms: 0 };
  const budget = termBudget(other);
  const active = Object.keys(T.terms).filter(id => T4[id] && T.terms[id].st === 'active');
  const activate = [], starts = [];
  const paused = Object.keys(T.terms).filter(id => T4[id] && T.terms[id].st === 'paused').sort((a, b) => termShown(b) - termShown(a));
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
  const phReviews = []; Object.keys(T.terms).forEach(id => { const ts = T.terms[id]; if (!T4[id] || ts.st === 'paused' || ts.st === 'wait' || ts.st === 'done') return; ts.ph.forEach((p, i) => { if (p.s === 3 && p.due && p.due <= t) phReviews.push({ type: 'term', k: 'review', id, p: i, due: p.due }); }); });
  phReviews.sort((a, b) => a.due < b.due ? -1 : 1);
  const maint = Object.keys(T.terms).filter(id => T4[id] && T.terms[id].st === 'paused' && !activate.includes(id) && T.terms[id].mdue && T.terms[id].mdue <= t && T.terms[id].ph.some(p => p.s >= 1)).sort((a, b) => T.terms[a].mdue < T.terms[b].mdue ? -1 : 1).map(id => ({ type: 'term', k: 'maint', id }));
  const tcards = Object.keys(S.cards).filter(id => ITEMS[id] && ITEMS[id].kind === 'term' && S.cards[id].due <= t).sort((a, b) => S.cards[a].due < S.cards[b].due ? -1 : 1).map(id => ({ type: 'card', id, term: true }));
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
  return { open: open.slice(0, openN), close: close.slice(0, closeN), activate, starts, pause, pace, budget, waiting: Math.max(0, open.length - openN) + Math.max(0, close.length - closeN) };
}
// Called when a session starts: the plan's activations and new starts become real state.
function commitTermPlan(tp) {
  if (!tp) return; const t = today();
  (tp.pause || []).forEach(id => { const ts = T.terms[id]; if (!ts || ts.st !== 'active') return; ts.st = 'paused'; if (!ts.mdue || ts.mdue < addDays(t, 1)) { ts.mdue = addDays(t, 1); ts.mivl = ts.mivl || 3; } });
  tp.activate.forEach(id => { T.terms[id].st = 'active'; });
  tp.open.forEach(s => { if (T.terms[s.id]) T.terms[s.id].asked = t; });
  tp.starts.forEach(s => { if (T.terms[s.id] && T.terms[s.id].st === 'active') return; const ts = newTermState(s.id, s.tier, 'active'); ts.asked = t; if (s.tier > 0) { ts.origin = 'tierup'; ts.floor = 1; ts.peak = 1; } T.terms[s.id] = ts; if (s.tier === 0) { if (!T.day || T.day.d !== t) T.day = { d: t, newTerms: 0 }; T.day.newTerms++; T.lastFill = 'new'; } else T.lastFill = 'tier'; });
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
    const L = LESSONS[ITEMS[id].lesson]; const m = CURRICULUM.modules.find(x => x.lessons.includes(L)); const prev = m && m.lessons[m.lessons.indexOf(L) - 1];
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
    '<li><b>🔍 See it first.</b> Anything that changes the shape of data (joins, GROUP BY, window functions, UNION, DISTINCT, WHERE vs HAVING, ORDER BY/LIMIT, CTEs, cleaning, dedupe, delete-then-insert) starts with pictures: the input tables, the query, and the result table, with kept rows ✓, rows with no match ◐ (their NULLs shown), dropped rows ✕ and duplicates ⧉. You can run each query for real. Then visual questions (tap the rows that survive, predict the row count, explain a NULL, run it yourself), and only then the theory, building blocks and definition phrases. Terms of an illustrated lesson start after you have seen its pictures. If you read a lesson before pictures existed, one lesson\'s pictures are added per day.</li>' +
    '<li><b>🖼 Every abstract idea, from several angles.</b> Not just SQL: entities and relationships, pipelines, orchestration, cloud and data modelling are each shown as pictures (tables, diagrams, timelines, arrows) from more than one angle before any definition. Example: before joins you see why data is split, what an entity, state, event and relationship are, and an ERD of what can join to what.</li>' +
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
    '<li><b>🔒 Progress is never reset.</b> Updates keep your streak, XP, levels, flashcards and term progress. Earlier term progress keeps its credit: you only add the missing steps.</li></ul>';
}
function viewLearn() {
  return '<header class="top"><button class="back" data-act="go" data-to="settings">‹ More</button><h1>How learning works</h1></header><main><section class="card">' + learnHowHTML() + '</section></main>' + nav('settings');
}
function viewHelpStep() {
  return '<div class="kicker">📖 New: how terms are learned</div><h2>How learning works now</h2>' + learnHowHTML() +
    '<p class="muted small">You can read this again anytime: More → How learning works.</p><div class="actions"><button class="btn primary big" data-act="helpDone" data-autofocus>Got it, start</button></div>';
}

/* ============================ ACTIONS ============================ */
const ACT = {
  go: el => go(el.dataset.to, el.dataset.l ? { l: el.dataset.l } : {}),
  startDaily: () => { const p = buildDailySession(); if (p.steps.length) { commitTermPlan(p.terms); startSession(p); } },
  startLesson: el => startSession(buildLessonSession(el.dataset.l)),
  startCards: () => { const p = buildCardSession(); if (p.steps.length) startSession(p); },
  quit: () => { if (confirm('End the session now? Everything you answered is already saved.')) { SESSION.stats.quit = true; endSession(); } },
  next: () => nextStep(),
  /* v6 illustration steps */
  illNext: () => { const st = SESSION.steps[SESSION.i]; const L = ILLUS[st.lesson]; if (st.sc + 1 >= L.scenes.length) { const vs = visState(st.lesson); if (!vs.seen) { vs.seen = today(); addXP(5); } saveTerms(); save(); } nextStep(); },
  illRun: async () => { const st = SESSION.steps[SESSION.i]; const sc = ILLUS[st.lesson].scenes[st.sc];
    try { F.run = tableHTML(await runIll(sc.sql, st.lesson), 20) + '<div class="muted small">Same rows as the drawing above (row order may differ: without ORDER BY it is not guaranteed).</div>'; } catch (e) { F.run = '<div class="ill-err">✕ ' + esc(e.message) + '</div><div class="muted small">That error is the point: the database refused the duplicate.</div>'; }
    render(); },
  vqTap: el => { if (F.done) return; const i = +el.dataset.r; const k = F.sel.indexOf(i); if (k >= 0) F.sel.splice(k, 1); else F.sel.push(i); render(); },
  vqTapC: el => { if (F.done) return; F.sel = [+el.dataset.c]; render(); },
  vqCls: el => { if (F.done) return; F.vals[+el.dataset.i] = +el.dataset.c; render(); },
  vqPick: el => { if (F.done) return; F.pick = +el.dataset.k; finishVQ(F.opts[F.pick].i === 0); render(); },
  vqRun: async () => { const st = SESSION.steps[SESSION.i]; F.code = document.getElementById('vqCode').value;
    try { F.out = tableHTML(await runIll(F.code, st.lesson), 20); } catch (e) { F.out = '<div class="bad small">SQL error: ' + esc(e.message) + '</div>'; } render(); },
  vqCheck: async () => {
    const st = SESSION.steps[SESSION.i]; const q = F.q;
    if (q.k === 'tapc') { if (!F.sel.length) { toast('Tap a column header'); return; } finishVQ(F.sel[0] === q.ans[0]); render(); return; }
    if (q.k === 'cls') { if (F.vals.some(v => v == null)) { toast('Sort every item first'); return; } const bad = q.items.filter((it, i) => F.vals[i] !== it[1]).length; finishVQ(!bad, bad ? bad + ' of ' + q.items.length + ' in the wrong group.' : ''); render(); return; }
    if (q.k === 'tap') { if (!F.sel.length) { toast('Tap at least one row'); return; } const ok = F.sel.length === q.ans.length && q.ans.every(i => F.sel.includes(i)); finishVQ(ok); render(); return; }
    F.code = document.getElementById('vqCode').value; if (/____/.test(F.code)) { toast('Fill in the ____ blanks first'); return; }
    try {
      const u = await runIll(F.code, st.lesson), e = await runIll(q.sol, st.lesson); F.out = tableHTML(u, 20);
      const c = compareResults(u, e, false); const bad = q.forbid && new RegExp(q.forbid, 'i').test(F.code);
      finishVQ(c.ok && !bad, bad ? 'Right rows, but this question asks you to do it without that keyword.' : c.ok ? '' : c.msg);
    } catch (err) { F.out = '<div class="bad small">SQL error: ' + esc(err.message) + '</div>'; finishVQ(false, 'The query has an error.'); }
    render();
  },
  vqIdk: () => { if (F.q.k === 'tap' || F.q.k === 'tapc') F.sel = F.q.ans.slice(); if (F.q.k === 'cls') F.vals = F.q.items.map(it => it[1]); if (F.q.k === 'mc') F.pick = -1; finishVQ(false); render(); },
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
S = loadState(); E = loadExt(); migrateExt(); T = loadTerms(); migrateTerms(); save();
try { history.replaceState({ screen: 'home', params: {} }, ''); } catch (e) {}
render();
if (/^https?:$/.test(location.protocol)) {
  const l = document.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.json'; document.head.appendChild(l);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
setTimeout(() => { getSQL().catch(() => {}); }, 400); // warm up the SQL engine

