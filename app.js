const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const addDays = require("date-fns/addDays");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const parseISO = require("date-fns/parseISO");
const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const co = (m) => {
  const v = format(new Date(m), "yyyy-MM-dd");
  return v;
};

const val = (a) => {
  const r = isValid(a);
  return r;
};

const cov = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const cands = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const candp = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const cat = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case cands(request.query):
      if (
        (category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING") &&
        (status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((p) => cov(p)));
      } else if (
        status !== "TO DO" &&
        status !== "IN PROGRESS" &&
        status !== "DONE"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case candp(request.query):
      if (
        (category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING") &&
        (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((p) => cov(p)));
      } else if (
        priority !== "HIGH" &&
        priority !== "MEDIUM" &&
        priority !== "LOW"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityAndStatusProperties(request.query):
      if (
        (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") &&
        (status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((p) => cov(p)));
      } else if (
        status !== "TO DO" &&
        status !== "IN PROGRESS" &&
        status !== "DONE"
      ) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        priority !== "HIGH" &&
        priority !== "MEDIUM" &&
        priority !== "LOW"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((p) => cov(p)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((p) => cov(p)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case cat(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((p) => cov(p)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      data = await database.all(getTodosQuery);
      response.send(data.map((p) => cov(p)));
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(cov(todo));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const p = co(date);
  console.log(p);
  const v = val(parseISO(p));
  console.log(v);
  if (v === true) {
    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = "${date}";`;
    const todo = await database.all(getTodoQuery);
    response.send(todo.map((p) => cov(p)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (val(parseISO(dueDate) !== true)) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}','${category}', '${dueDate}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (val(parseISO(dueDate) !== true)) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date="'${dueDate}'"
    WHERE
      id = ${todoId};`;

    await database.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
