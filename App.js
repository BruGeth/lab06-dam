import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('Lista tus tareas aquí');
  const [messageColor, setMessageColor] = useState('#007AFF');

  // Cargar tareas al montar
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem('tasks');
        if (saved) setTasks(JSON.parse(saved));
      } catch (e) {
        setMessage('Error cargando tareas');
      }
    };
    loadTasks();
  }, []);

  // Guardar tareas y actualizar mensaje cada vez que cambian
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (e) {
        setMessage('Error guardando tareas');
      }
    };
    saveTasks();

    if (tasks.length > 5) {
      setMessage('Demasiadas tareas pendientes');
      setMessageColor('red');
    } else {
      setMessage(`Total de tareas: ${tasks.length}`);
      setMessageColor('#007AFF');
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (task.trim() === '') {
      setMessage('La tarea no puede estar vacía');
      setMessageColor('red');
      return;
    }
    setTasks([...tasks, { key: Date.now().toString(), text: task }]);
    setTask('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe una tarea"
        value={task}
        onChangeText={setTask}
      />
      <Button title="Agregar tarea" onPress={handleAddTask} />
      <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.text}</Text>
          </View>
        )}
        style={styles.list}
      />
      {/* StatusBar removido */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 8,
    width: '100%',
    marginBottom: 8,
  },
  message: {
    marginVertical: 8,
    fontWeight: 'bold',
  },
  list: {
    width: '100%',
    marginTop: 8,
  },
  taskItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});