import express from 'express';
import env from 'env-var'
import { Sequelize, DataTypes } from 'sequelize';

const port = env.get('PORT').required().default(3000).asPortNumber()
const storagePath = env.get('STORAGE_PATH').default("/data/database.sqlite").asString()

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath
  });

const DataRequest = sequelize.define('DataRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    properties: {
        type: DataTypes.JSON
    },
    contractId: {
        type: DataTypes.UUID
    },
    endpoint: {
        type: DataTypes.STRING
    },
    authKey: {
        type: DataTypes.STRING
    },
    authCode: {
        type: DataTypes.STRING
    }
});

await sequelize.sync()

const app = express()

app.use(express.json())

app.get('/:id', async (req, res) => {
    const dataRequest = await DataRequest.findByPk(req.params.id)
    if (dataRequest) {
        return res.status(200).json(dataRequest)
    }
    res.status(404).json({
        statis: 404,
        error: "not_found",
        message: 'Data Request not found' 
    })
})

app.post('/receiver/urn:connector:provider/callback', async (req, res) => {
    const dataRequest = await DataRequest.create(req.body)
    res.status(201).json(dataRequest)
})

// todo: add endpoint for minio and s3

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});