// modelo  de usuario 
/* define la estructura de base de datos para los usuarios 
encripta la contraseña
manejo de roles, (admin, coordinador, auxiliar)
*/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Estructura de la base de datos para los usuarios
const userShema = new mongoose.Schema({
    // El nombre del usuario debe ser unico en toda la base de datos
    username: {
        type : String,
        required: true, 
        unique: true,
        trim: true //elimina los espacios en blanco al inicio y al final
    },

    //Email debe ser unico valido en minusculas
    email: {
        typer : String,
        required: true,
        unique: true,
        lowercase: true, //convierte a minusculas
        trim: true, //elimina espacios
        match: [/\S+@\S+\.S+/, 'El correo no es valido'] // valida el patron email
    },
    // contreseña - requerida, minimo 6 caracteres
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // no incluir en resultados por defecto 
    },
    // rol del usuario restringe valores especificos 
    role:{
        type : String,
        enum: ['admin', 'coordinador', 'auxiliar'], // solo estos valores sojn permitidos
        default: 'auxiliar' //por defecto, los nuevos usuarios son auxiliares
    },
    // usuarios activos 
    active : {
        type: Boolean, 
        default: true, // nuevos usuarios comienzan activos
    },
},{
    timestamps: true, // agrega createdAt y updateAt automaticamente
    versionKey: false // no incluir __v en el control de versiones de Mongoose
});

// Middleware encripta la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try{
        //generar slat con complejidad de 10 rondas
        //mayoe numero de rondas = mas seguro pero mas lento
        const salt = await bcrypt.genSalt(10);

        //encripta el password con el salt  generado
        this.password = await bcrypt.hash(this.password, salt);

        //continuar con el guardado normal 
        next();
    } catch (error) {
        //si hay error en encriptación pasar error al siguiente middleware
        next(error);

    }
});

// crear y exportar el modulo de usuario
module.exports = mongoose.model('User', userSchema);