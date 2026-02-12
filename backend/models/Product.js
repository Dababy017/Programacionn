/**
 * Modelo de producto MONGODB
 * Define la estructura del producto
 * el producto depende de una subcategoria depende de una categoria
 * muchos productos pueden pertenecer a una subcategoria
 * Tiene relacion un user para ver quien creo el producto
 * Soporte de imagenes (array de url)
 * validacion de valores numericos (no negativos)
*/

const mongoose =require('mongoose');

// campos de la tabla producto

const productSchema = new mongoose.Schema({
    //nombre del producto unico y requerido
    name:{
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true, //no pueden haber 2 productos con el mismo nombre 
        trim: true //
    },
 

       // descricion del producto requerido 
    description:{
        type: String,
        required: [true, 'la descripcion es requerida'],
        trim: true,

    },
    //Precio en unidades monetarias
    //No puede ser negativo
    price:{
        type: Numnber,
        required: [true, 'el precio es obligatorio'],
        min: [0,'El precio no puede ser negativo']
    },
    //Cantidad de stock
    //No puede ser negativo
    stock:{
        type: Numnber,
        required: [true, 'el stock es obligatorio'],
        min: [0,'El stock no puede ser negativo']
    },

    // Categoria padre esta subcategoria pertenece a una categoria 
    // relacion 1 - muchos una categoria puede tener muchas subcategorias
    //un producto pertenece a una subcategoria pero una subcategoria puede tener muchos productos relacion 1 a muchos

    subcategory:{
        type: mongoose.Schema.Type.ObjectId,
        ref: 'subcategory', // puede ser poblasdo con .populate(Category)
        required: [true, 'la subcategoria es requerida']
    },


    category:{
        type: mongoose.Schema.Type.ObjectId,
        ref: 'Category', // puede ser poblasdo con .populate(Category)
        required: [true, 'la categoria es requerida']
    },

    //quienn creo el producto
    //referencia de user no requerido
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' //puede ser poblado para mostrar los usuarios
    },

    //Array de urls de imagen de productos
    images:[{
        type: String, //url de la umagen 
    }],


    // activa  descativa el producto 
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
productSchema.post('save', function(error, doc, next) {
        // verificar 
        if (error.name == 'MonogoServerError ' && error.code ===1000) {
            return next(new Error('ya existe un producto con este nombre'))
        }        
        //pasar el error tal como es
        next(error);    
});

/**
 * crear indice unico
 * 
 * Mongo rechazara cualquier intento de insertar o actualizar un documento con un valor sw name que ya exista
 * aumenta la velocidad de las busquedas
 */


//Exportar el modelo
module.exports = mongoose.model('product', productSchema);
