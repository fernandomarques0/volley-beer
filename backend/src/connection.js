import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI não configurada nas variáveis de ambiente');
  }

  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB conectado com sucesso!');
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro no MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });
    
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err);
    throw err;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB desconectado através do término da aplicação');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao fechar conexão:', err);
    process.exit(1);
  }
});