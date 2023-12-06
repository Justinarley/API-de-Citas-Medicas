import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';  // Importa cors
import pkg from 'pg';

const { Client } = pkg;
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Clinica',
  password: '1234',
  port: 5432,
});
client.connect();

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(cors());  // Usa cors antes de definir rutas
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
  
app.get('/', (req, res) => {
  res.send('Api');
});

app.post('/registro-pacientes', async (req, res) => {
    const pacienteData = req.body;
  
    try {
      const result = await client.query(
        'INSERT INTO RegistroPacientes (CI, NombrePaciente, ApellidoPaciente, Telefono, Direccion, CorreoElectronico, FechaNacimiento, AntecedentesMedicos) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          pacienteData.CI,
          pacienteData.NombrePaciente,
          pacienteData.ApellidoPaciente,
          pacienteData.Telefono,
          pacienteData.Direccion,
          pacienteData.CorreoElectronico,
          pacienteData.FechaNacimiento,
          pacienteData.AntecedentesMedicos,
        ]
      );
  
      res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  });

// Nueva ruta para la autenticación
app.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const result = await client.query(
      'SELECT * FROM usuarios WHERE usuario = $1 AND contrasena = $2',
      [usuario, contrasena]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.listen(app.get('port'), () => {
    console.log('listening on port', app.get('port'));
  });
// Agrega esta ruta al final de tu archivo
app.get('/lista-pacientes', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM registropacientes');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor api' });
    }
});
// Agrega esta ruta al final de tu archivo de servidor
app.get('/lista-pacientes/:ci', async (req, res) => {
    const ci = req.params.ci;
  
    try {
      const result = await client.query('SELECT * FROM registropacientes WHERE CI = $1', [ci]);
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ message: `No se encontró un paciente con CI ${ci}` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor al obtener detalles del paciente' });
    }
  });

// Ruta para actualizar un paciente
app.put('/actualizar-paciente/:ci', async (req, res) => {
    const ci = req.params.ci;
    const updatedPaciente = req.body;

    try {
    const result = await client.query(
        'UPDATE registropacientes SET nombrepaciente = $1, apellidopaciente = $2, telefono = $3, direccion = $4, correoelectronico = $5, fechanacimiento = $6, antecedentesmedicos = $7 WHERE ci = $8',
        [
        updatedPaciente.nombrepaciente,
        updatedPaciente.apellidopaciente,
        updatedPaciente.telefono,
        updatedPaciente.direccion,
        updatedPaciente.correoelectronico,
        updatedPaciente.fechanacimiento,
        updatedPaciente.antecedentesmedicos,
        ci,
        ]
    );

    if (result.rowCount > 0) {
        res.status(200).json({ message: `Datos del paciente con CI ${ci} actualizados exitosamente` });
    } else {
        res.status(404).json({ message: `No se encontró un paciente con CI ${ci}` });
    }
    } catch (error) {
    console.error('Error al actualizar el paciente en la base de datos:', error);
    res.status(500).json({ message: 'Error en el servidor al intentar actualizar al paciente' });
    }
});
  
// Ruta para eliminar un paciente
app.delete('/eliminar-paciente/:ci', async (req, res) => {
    const ci = req.params.ci;
  
    try {
      const result = await client.query('DELETE FROM RegistroPacientes WHERE CI = $1', [ci]);
  
      if (result.rowCount > 0) {
        res.status(200).json({ message: `Paciente con CI ${ci} eliminado exitosamente` });
      } else {
        res.status(404).json({ message: `No se encontró un paciente con CI ${ci}` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor al intentar eliminar al paciente' });
    }
  });
  
 // ... (importaciones y configuraciones previas)

// Ruta para el registro de doctores
app.post('/registro-doctores', async (req, res) => {
  const doctorData = req.body;

  try {
    const result = await client.query(
      'INSERT INTO RegistroDoctores (nombre, apellidos, telefono, especialidad, cedula) VALUES ($1, $2, $3, $4, $5)',
      [
        doctorData.nombre,
        doctorData.apellidos,
        doctorData.telefono,
        doctorData.especialidad,
        doctorData.cedula,
      ]
    );

    res.status(200).json({ message: 'Registro de doctor exitoso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al registrar al doctor' });
  }
});

// Ruta para obtener la lista de doctores
app.get('/lista-doctores', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM RegistroDoctores');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al obtener la lista de doctores' });
  }
});

// Ruta para obtener detalles de un doctor por ID
app.get('/lista-doctores/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await client.query('SELECT * FROM RegistroDoctores WHERE iddoctor = $1', [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: `No se encontró un doctor con ID ${id}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al obtener detalles del doctor' });
  }
});

// Ruta para actualizar un doctor
app.put('/actualizar-doctor/:id', async (req, res) => {
  const id = req.params.id;
  const updatedDoctor = req.body;

  try {
    const result = await client.query(
      'UPDATE RegistroDoctores SET nombre = $1, apellidos = $2, telefono = $3, especialidad = $4, cedula = $5 WHERE iddoctor = $6',
      [
        updatedDoctor.nombre,
        updatedDoctor.apellidos,
        updatedDoctor.telefono,
        updatedDoctor.especialidad,
        updatedDoctor.cedula,
        id,
      ]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ message: `Datos del doctor con ID ${id} actualizados exitosamente` });
    } else {
      res.status(404).json({ message: `No se encontró un doctor con ID ${id}` });
    }
  } catch (error) {
    console.error('Error al actualizar el doctor en la base de datos:', error);
    res.status(500).json({ message: 'Error en el servidor al intentar actualizar al doctor' });
  }
});

// Ruta para eliminar un doctor
app.delete('/eliminar-doctor/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await client.query('DELETE FROM RegistroDoctores WHERE iddoctor = $1', [id]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: `Doctor con ID ${id} eliminado exitosamente` });
    } else {
      res.status(404).json({ message: `No se encontró un doctor con ID ${id}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al intentar eliminar al doctor' });
  }
});



  
