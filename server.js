'user strict' 
const cors = require ('cors');
const express = require ('express');
const properties = require('./config/properties');
const DB = require ('./config/db');
const morgan =  require ('morgan');
const cookieParser = require ('cookie-parser');


// Aplicacion / api, permite utilizar rutas, operar con el sv etc.
const app = express();


//import routes
const userRoutes = require('./rutas/user');
const authRoutes = require('./rutas/auth');
const regionRoutes = require('./rutas/region');
const estadoRoutes = require('./rutas/estado');
const tiposTatuajesRoutes = require('./rutas/tipoTatuajes');
const publicacionesRoutes = require ('./rutas/publicaciones');
const proyectoRoutes = require ('./rutas/proyecto');
const ofertaRoutes = require ('./rutas/ofertas');

//Iniciar base de datos
DB();

//middleware 
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


//RUTAS
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', regionRoutes);
app.use('/api', estadoRoutes);
app.use('/api', tiposTatuajesRoutes);
app.use('/api', publicacionesRoutes);
app.use('/api', proyectoRoutes);
app.use('/api', ofertaRoutes);

// app.use('/',  (err, res) => {
//     res.json('Bienvenido a Inkapp!!');
// })

app.listen(properties.PORT, () => console.log(`Server running on port ${properties.PORT}`));
