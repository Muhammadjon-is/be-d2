import PdfPrinter from "pdfmake"

export const getPDFReadableStream = booksArray => {
  // Define font files
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  }

  const printer = new PdfPrinter(fonts)

  console.log(
    booksArray.map(book => {
      return [book.title, book.category, book.price]
    })
  )

  const docDefinition = {
    content: [booksArray[0].title, booksArray[0].category],
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
  pdfReadableStream.end()

  return pdfReadableStream
}