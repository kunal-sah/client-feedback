import { PrismaClient } from '@prisma/client';
import { prompt } from 'enquirer';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const { email, password, name } = await prompt<{
      email: string;
      password: string;
      name: string;
    }>([
      {
        type: 'input',
        name: 'email',
        message: 'Enter admin email:',
        validate: (value) => {
          if (!value) return 'Email is required';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter admin password:',
        validate: (value) => {
          if (!value) return 'Password is required';
          if (value.length < 8) return 'Password must be at least 8 characters long';
          return true;
        }
      },
      {
        type: 'input',
        name: 'name',
        message: 'Enter admin name:',
        validate: (value) => {
          if (!value) return 'Name is required';
          return true;
        }
      }
    ]);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully:', { id: user.id, email: user.email, name: user.name });
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('Error: A user with this email already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 