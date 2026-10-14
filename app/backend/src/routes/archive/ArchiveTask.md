Goal: create a task archive management with two archiving modes: instant archive and time-based archive

Create a column in the archive table: **ArchiveMode**: which states either instant archive mode or time-based mode

Case: Create an archived task while recovering existing data without any data loss

**Use of transaction**: to avoid losing data because if any data is lost then the action simply fails without succeeding

1. Drag & drop into DONE column ==> Post
2. Post = TaskId + ProjectId + WorkspaceId + UserId + IsArchived (Boolean)
3. Server receives = Read UserId then what is the user's role
4. Move the task to the archive zone = store in ArchiveCardsTable ==> Insert

**Transaction: if it succeeds it goes through, if any data is lost then the action has completely failed because no data loss will be tolerated**

4. Store the task in the archived tasks table
5. Feedback to say that it was archived successfully
6. Display the task

---

Case: unarchive a task (patch = boolean to say whether the task is archived or not)
Case: delete one or more archived tasks (deleted)
Case: Ability to display the task (get)
