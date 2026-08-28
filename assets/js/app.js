const nombreActividad = "Taller de fotografía";
const capacidad = 30;
let inscritos = 18;

console.log(nombreActividad);
console.log(capacidad);
console.log(inscritos);

const cuposDisponibles = capacidad - inscritos;

console.log(
  `Quedan ${cuposDisponibles} cupos disponibles`
);

function calcularCupos(capacidad, inscritos) {
  const disponibles = capacidad - inscritos;
  return disponibles;
}

const cuposTaller = calcularCupos(30, 18);
console.log(cuposTaller);

const actividades = [
  "Taller de fotografía",
  "Concierto comunitario",
  "Muestra de teatro"
];

console.log(actividades[0]);
console.log(actividades[1]);