import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import Usuario, { IUsuario } from '../../domain/models/usuario';
import jwt from 'jsonwebtoken';

// Crear un nuevo usuario
export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    const token = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET || 'your_secret_key',);
    res.status(201).send({ usuario, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

//Vlidacion de usuario usando JWT
export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario || usuario.contrasena !== contrasena) {
      return res.status(401).send({ error: 'Credenciales no válidas.' });
    }
    const token = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET || 'your_secret_key',);
    res.send({ usuario, token });
  } catch (error) {
    res.status(400).send(error);
  }
};


// Obtener todos los usuarios
export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.find({});
    res.status(200).send(usuarios);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  const _id = req.params.id;
  try {
    const usuario = await Usuario.findById(_id);
    if (!usuario) {
      return res.status(404).send();
    }
    res.status(200).send(usuario);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Actualizar un usuario por ID
export const actualizarUsuario = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body) as Array<keyof IUsuario>;
  const allowedUpdates: Array<keyof IUsuario> = ['nombre', 'correo', 'contrasena', 'telefono'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Actualización no permitida' });
  }

  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    updates.forEach((update) => {
      (usuario as any)[update] = req.body[update];
    });
    await usuario.save();
    res.status(200).send(usuario);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Eliminar un usuario por ID
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).send();
    }
    res.status(200).send(usuario);
  } catch (error) {
    res.status(500).send(error);
  }
};
