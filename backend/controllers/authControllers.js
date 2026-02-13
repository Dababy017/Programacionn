/**
 * Controlador de atenticacion 
 * maneja el registro login y generacion de token JWT
 */

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

/**
 * SINGUP: crear nuevo usuario
 * POST /api/auth/singup
 * Body { usename, email, password, role}
 * Crea usuario en la base de datos
 * encripta contraseña antes de guardar con bcrypt
 * genera token JWT
 * Retorna ususario sin mostrar la contraseña
 */
exports.singup = async (req, res) => {
    try {
        //Crear nuevo usuario
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'auxiliar' //Por defecto el rol e auxiliar
        })

        // Guardar en base de datos
        // la contraseña se encripta automaticamente en el middleware del modelo 
        const saveUser = await user.save();

        // Generar token JWT que expira en 24 horas 
        const token = jwt.sign({
            
            id: savedUser._id,
            role: savedUser._role,
            email: savedUser._email
         },
           config.secret,
           { expiresIn: config.jwtExpiration }
        );


        // Preparando respuesta 
        const UserResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
        };

        res.estatus(200).json({
            succes: true,
            message: 'Usuario registrado correctamente',
            token: token,
            user: UserResponse
        });
    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: 'Errot al registrar usuario',
            error: error.message
        });
    }
};

/**
 *  SINGIN: Iniciar sesion
 *  POST /api/auth/singin
 *  body {email o usuario, password }
 * busca el usuario por email o username
 * valida la contrasela con bcrypt
 * si es correcto el token JWT 
 * Token se usa para autenticar futuras solicitudes
 */
 
exports.signin = async (req, res) => {
    try {
        //validar que se envie el email o username
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({
                succes: false,
                message: 'email o username requerido'
            });
        }

        //validar que se envie la contraseña
        if (!req.body.password) {
            return res.status(400).json({
                succes: false,
                message: 'Password requerido'
            });
        }

        
        // buscar usuario por email o username
        const user = await User.findOne ({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        }).select('+password'); // include password field 

        // si no se encuentra el usuario
        if (!user) {
            return res.status(404).json({
                succes: false,
                message: 'Usuario no encontrado'
            });            
        }

        //Verificar que el usuario tenga cotraseña
        if (!user.password) {
            return res.status(500).json ({
                succes: false,
                message: 'Error interno: usuario sin contraseña'
            });
        }

        // comparar contraseña enviada con el hash almacenado 
        const isPasswordValid = await bcrypt.compare
        (req.body.password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json ({
                succes: false,
                message: 'contraseña incorrecta'
            });
        }

        // Generar token JWT 24 horas
        const token =jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },
            config.secret,
            { expiresIn: config.jwtEpiration }
        );

        //
        const UserResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        
        // prepara respuesrta sin mostrar la contraseña
        res.status(200).json ({
            succes: true,
            message: 'Inicio de sesion exitoso',
            token: token,
            user: UserResponse
        });
    }   catch (error) {
            return res.status(500).json({
                succes: false,
                message: 'Error al iniciar sesion',
                error: error.message
        });
    }
};
