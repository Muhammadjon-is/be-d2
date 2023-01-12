import express from "express";
import fs from "fs";

import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../lib/fs-tools.js";
import { getPDFReadableStream } from "../try-pdf/try-pdf.js";

// ..........................................Creating CRUD operations...............................
const authorsRouter = express.Router(); //declaring the Router that connects our operations to the server

// 1. Create
authorsRouter.post("/", async (request, response) => {
  const newAuthor = {
    ...request.body,
    createdAt: new Date(),
    id: uniqid(),
    avatar: `https://ui-avatars.com/api/?name=${request.body.firstName}+${request.body.lastName}`,
  }; //new author is contained by the spreaded req body, and also serverGenerated values
  const authorsArray = await getAuthors(); 
  authorsArray.push(newAuthor); //pushing the newAuthor to the previously declared array
  await writeAuthors(authorsArray); //writing to the pathname the JSON Array
  response.status(200).send({ id: newAuthor.id }); //sending back the response
});

// 2. Read
authorsRouter.get("/", async (request, response) => {
  const authors = await getAuthors();
  response.send(authors); 
});

// 3. Read individual author
authorsRouter.get("/:id", async (request, response) => {
  const authorId = request.params.id; 
  const authorsArray = await getAuthors(); 
  const searchedAuthor = authorsArray.find((author) => author.id === authorId); //retrieves the OBJ of the array that corresponds to the criteria
  response.send(searchedAuthor); //sends back the response
});

// 4. Update
authorsRouter.put("/:id", async (request, response) => {
  const authorId = request.params.id; 
  const authorsArray = await getAuthors(); 
  const oldAuthorIndex = authorsArray.findIndex(
    (author) => author.id === authorId
  ); //retrieves the index corresponding to the user's passed ID
  const oldAuthor = authorsArray[oldAuthorIndex]; //assigning the correct old author based on the previously found index
  const updatedAuthor = {
    ...oldAuthor,
    ...request.body,
    updatedAt: new Date(),
  }; 
  authorsArray[oldAuthorIndex] = updatedAuthor; 
  await writeAuthors(authorsArray); 
  response.send(updatedAuthor);
});

// 5.DELETE
authorsRouter.delete("/:id", async (request, response) => {
  const authorId = request.params.id; 
  const authorsArray = await getAuthors(); 
  const filteredAuthorsArray = authorsArray.filter(
    (author) => author.id !== authorId
  ); 
  await writeAuthors(filteredAuthorsArray); 
  response.status(204).send(); 
});

// 6. Create a new author with condition
authorsRouter.post("/checkEmail", async (request, response) => {
  const newAuthor = { ...request.body, createdAt: new Date(), id: uniqid() }; 
  const authorsArray = await getAuthors(); 
  const existingAuthor = authorsArray.find(
    (author) => author.email === newAuthor.email
  ); 
  existingAuthor
    ? response.send({ isEmailAlreadyInUse: true })
    : response.send({ isEmailAlreadyInUse: false }); 
});

authorsRouter.get("/booksJSON", (req, res, next) => {
  try {
    // SOURCES (file on disk, http request, ...) --> DESTINATION (file on disk, terminal, http response, ...)

    // SOURCE (READABLE STREAM on books.json file) --> DESTINATION (WRITABLE STREAM http response)

    res.setHeader("Content-Disposition", "attachment; filename=books.json.gz")
    // without this header the browser will try to open (not save) the file.
    // This header will tell the browser to open the "save file as" dialog
    const source = getBooksJsonReadableStream()
    const transform = createGzip()
    const destination = res
    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/pdf", (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=test.pdf")

  const source = getPDFReadableStream([
    {
      asin: "0345546792",
      title: "The Silent Corner: A Novel of Suspense (Jane Hawk)",
      img: "https://images-na.ssl-images-amazon.com/images/I/91dDIYze1wL.jpg",
      price: 7.92,
      category: "horror",
    },
    {
      asin: "0735218994",
      title: "Celtic Empire (Dirk Pitt Adventure)",
      img: "https://images-na.ssl-images-amazon.com/images/I/91xI4GjM7jL.jpg",
      price: 17.32,
      category: "horror",
    },
  ])
  const destination = res
  pipeline(source, destination, err => {
    if (err) console.log(err)
  })
})

export default authorsRouter;
