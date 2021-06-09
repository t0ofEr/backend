const Proyecto = require ('../model/proyecto.model');
const { errorHandler } = require ('../helpers/dbErrorHandler');
const _ = require( 'lodash');
const formidable = require ('formidable');
const fs = require ('fs');

exports.create = (req, res, next ) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
     
    if(req.profile.membresia == false) {
        return res.json({
            error: 'Lo sentimos, debes adquirir una membresía para utilizar esta opción'
        })
    }
    form.parse(req, (err, fields, files) => {

        
        if(err){
            return res.status(400).json({
                error: 'No se pudo cargar imagen'
            })
        }
        
        let proyecto = new Proyecto (fields)

        // 1kb = 1000b
        // 1mb = 1000000b

        const {nombre, tamaño, parteCuerpo, estiloTatuaje, estado} = fields
        if(!nombre || !tamaño || !parteCuerpo || !estiloTatuaje || !estado){
            return res.status(400).json({
                error: 'Debe rellenar todos los campos Obligatorios!'
            })
        }
        if(files.img.type == null){
            return res.json({
                error: 'Tú proyecto debe contener una imagen'
            })
        }

        if(files.img){
            //Tamaño mayor a 1mb 
            if(files.img.size > 1000000){
                return res.status(400).json({
                    error: 'La imagen no puede superar 1mb en tamaño'
                })
            }

            proyecto.img.data = fs.readFileSync(files.img.path);
            proyecto.img.contentType = files.img.type;
        }
        proyecto.creador = req.profile._id
        proyecto.save((err, result) => {
        
            if(err){
                return res.status(400).json({
                    error: 'Ha ocurrido un error inesperado'
                });
            }
            
            
            res.json({
                proyecto
            });
               
        })
    });
    
}

exports.proyectoPorId = (req, res, next, id) => {
    Proyecto.findById(id)
    .populate('estado', 'nombre')
    .populate('creador', 'nombre')
    .populate('estiloTatuaje', 'nombre')
    .populate({path:'oferta', model: 'Oferta'})
    .populate({path: 'oferta', populate: { path: 'estado', select: 'nombre'}})
    .populate({path: 'oferta', populate: { path: 'ofertante', select: 'userName'}})
    .exec((err, proyecto) => {
        if(err || !proyecto) {
            return res.status(400).json({
                error: 'proyecto no encontrado'
              }); 
        }
        req.proyecto = proyecto;
        next();
    })
};

exports.buscar = (req, res) => {
    return res.json(req.proyecto);
}

exports.listaProyectos = (req, res) => {
    Proyecto.find()
    .populate('estado', 'nombre')
    .populate('creador', 'nombre')
    .populate('estiloTatuaje', 'nombre')
    .populate({path:'oferta', model: 'Oferta'})
    .populate({path: 'oferta', populate: { path: 'estado', select: 'nombre'}})
    .populate({path: 'oferta', populate: { path: 'ofertante', select: 'userName'}})
    .exec((err, data) => {
        if(err) {
            return res.status(400).json({
                error: 'No existen estados aún!'
              }); 
        }
        res.json({data})
    })
};

exports.modificar = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    form.parse(req, (err, fields, files) => {


        if(err){
            return res.status(400).json({
                error: 'No se pudo cargar imagen'
            })
        }
        
        let proyecto = req.proyecto
        proyecto = _.extend(proyecto, fields)
        // 1kb = 1000b
        // 1mb = 1000000b

        const {nombre, tamaño, parteCuerpo, estiloTatuaje} = fields
        if(!nombre || !tamaño || !parteCuerpo || !estiloTatuaje){
            return res.status(400).json({
                error: 'Debe rellenar todos los campos Obligatorios!'
            })
        }

        if(files.img.type == null){
            return res.json({
                error: 'Tú publicación debe contener una imagen'
            })
        }

        if(files.img){
            //Tamaño mayor a 1mb 
            if(files.img.size > 1000000){
                return res.status(400).json({
                    error: 'La imagen no puede superar 1mb en tamaño'
                })
            }
            proyecto.img.data = fs.readFileSync(files.img.path);
            proyecto.img.contentType = files.img.type;
        }
        
        proyecto.save((err, result) => {
        
            if(err){
                return res.status(400).json({
                    error: 'Ha ocurrido un error'
                });
            }
            
            res.json({
                mensaje: 'Has modificado tu proyecto con exito!',
                resultado: result
            });
               
        })

    });
    
}

exports.eliminar = (req, res) => {
    let proyecto = req.proyecto

    proyecto.remove((err, proyectoEliminado)=>{
        if(err){
            return res.status(400).json({error: 'Ha ocurrido un error'});
        }
        res.json({
            mensaje: `Tú proyecto: ${proyectoEliminado.nombre}, ha sido eliminado con exito!`
        })
    }
    );
}

exports.listaProyectosUsuarios = (req, res) => {
    const user = req.profile

    Proyecto.find({creador: user._id})
    .populate('estado', 'nombre')
    .populate('creador', 'nombre')
    .populate('estiloTatuaje', 'nombre')
    .populate({path:'oferta', model: 'Oferta'})
    .populate({path: 'oferta', populate: { path: 'estado'}})
    .populate({path: 'oferta', populate: { path: 'ofertante', select: 'userName'}})
    .exec((err, data) => {
        if(err) {
            return res.status(400).json({
                error: 'Ha ocurrido un error'
              }); 
        }
        if(data.length === 0){
            res.json({error: 'Aún no tienes proyectos'})
        }else{
        res.json({data})}
    })
};

exports.img = (req, res, next) => {
    if(req.proyecto.img.contentType == null){
        return res.json({error: 'No se pudo cargar tú imagen o no existe!'})
    }
    
    if(req.proyecto.img.data){
        res.set('Content-Type', req.proyecto.img.contentType)
        
        return res.send(req.proyecto.img.data)
    }
    
    next()
}