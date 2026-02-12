/**
 * Modelo de subcategoria MONGODB
 * Define la estructura de la subcategoria
 * la subcategoria depende de una categoria
 * muchos productos pueden pertenecer a una subcategoria
 * Muchas subcateogrias dependen de una sola categoria
 */

const mongoose =require('mongoose');

// campos de la tabla subcategoria

const subcategorySchema = new mongoose.Schema({
    //nombre de la subcategoria unico y requerido
    name:{
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true, //no pueden haber 2 subcategorias con el mismo nombre 
        trim: true //
    },
    // descricion de la subcategoria requerida 
    description:{
        type: String,
        required: [true, 'la descripcion es requerida'],
        trim: true,

    },

    // Categoria padre esta subcategoria pertenece a una categoria 
    // relacion 1 - muchos una categoria puede tener muchas subcategorias
    category:{
        type: mongoose.Schema.Type.ObjectId,
        ref: 'Category', // puede ser poblasdo con .populate(Category)
        required: [true, 'la categoria es requerida']
    },


    // activa  descativa la subcategoria
    active:{
        type: Boolean,
        default: true
    }    
},{      
    
    timestamps: true, //agrega createdAt y UpdatesAt
    versionKey: false, 
    
});


/**
 * MIDDLE PRE-SAVE
 * Limpia indices duplicados
 * MongoDB a veces multiplica indices con el mismo nombre
 * esto causa conflictos al intentar dropIndex o recrear indices
 * este middleware limpia los indices problematicos
 * proceso
 * 1 obtiene una lista de todos los indices de la coleccion 
 * 2 busca si existe indice con nombre name_1 (antiguo o duplicado)
 * si existe lo elimina antes de nuevas operaciones
 * ignora errores si el indixe no existe 
 * continua con el guardado normal
 */
subcategorySchema.post('save', function(error, doc, next) {
        // verificar 
        if (error.name == 'MonogoServerError ' && error.code ===1000) {
            next(new Error('ya existe una subcategoria con este nombre'));
    }  else{
        //pasar el error tal como es
        next(error);
    }
});

/**
 * crear indice unico
 * 
 * Mongo rechazara cualquier intento de insertar o actualizar un documento con un valor sw name que ya exista
 * aumenta la velocidad de las busquedas
 */


//Exportar el modelo
module.exports = mongoose.model('subcategory', subcategorySchema);
