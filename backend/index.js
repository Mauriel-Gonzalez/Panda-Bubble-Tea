const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

app.get("/menu", (req, res) => {
  res.json([
    { nombre: "Té de matcha", precio: 130 },
    { nombre: "Ice espresso Latte", precio: 130 },
    { nombre: "Smoothie de piña colada", precio: 130 },
    { nombre: "Té frío de limón y frutos rojos", precio: 130 },
    { nombre: "Milk tea de Jasmine", precio: 130 }
  ]);
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
