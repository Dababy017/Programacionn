/**
 * Modelo de categoria MONGODB
 * Define la estructura de la categoria
 */

const mongoose =require('mongoose');

// campos de categoria

const categorySchema = new mongoose.Schema({
    //nombre de la categoria unico y requerido
    name:{
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true //
    },
    // descricion de la categoria requerida 
    description:{
        type: String,
        required: [true, 'la descripcion es requerida'],
        trim: true,

    },
    // activa  descativa la categoria
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
categorySchema.pre('save', async function(next) {
    try{
        //Obtener referencia de la coleccion de mongodb
        const collection = this.constructor.collection;
        
        //obtener lista de los indices
        const indexes = await collection.indexes();

        //Buscar si existe indice problematico con nombre "name_1"
        // (del orden : 1 significa ascendente)
        const problematicIndex = indexes.find(index => index.name == 'name_1');

        // si lo encuentra, eliminarlo 
        if (problematicIndex){
            await collection.dropIndex('name_1'); 
        }
    } catch (err){
        //si el error es Index no found no es problema - continuar 
        // si es otro error pasaerlo al siguiente middlware 
        if(!err.message.includes('Index no found')){
            return next(err);
        }
    }
    // Continuaer con el guardado
    next();
});

/**
 * crear indice unico
 * 
 * Mongo rechazara cualquier intento de insertar o actualizar un documento con un valor sw name que ya exista
 * aumenta la velocidad de las busquedas
 */

categorySchema.index({name: 1},{
    unique: true,
    name: 'name_1'//nombre explicito para evitar conflictos
});
//Exportar el modelo
module.exports = mongoose.model('Category', categorySchema)
