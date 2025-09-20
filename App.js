import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

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
    setTasks([...tasks, { key: Date.now().toString(), text: task, completed: false }]);
    setTask('');
  };

  const handleToggleComplete = (key) => {
    setTasks(tasks.map(t =>
      t.key === key ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleDeleteTask = (key) => {
    setTasks(tasks.filter(t => t.key !== key));
  };

  const handleDeleteCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
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
      <TouchableOpacity
        style={styles.deleteCompletedBtn}
        onPress={handleDeleteCompleted}
        disabled={tasks.filter(t => t.completed).length === 0}
      >
        <MaterialIcons name="delete-sweep" size={24} color="#fff" />
        <Text style={styles.deleteCompletedText}>Eliminar completadas</Text>
      </TouchableOpacity>
      <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => handleToggleComplete(item.key)} style={{ flex: 1 }}>
              <Text style={item.completed ? styles.completedText : null}>
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item.key)}>
              <Text style={styles.deleteButton}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    color: 'red',
    marginLeft: 16,
    fontWeight: 'bold',
  },
  deleteCompletedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 5,
    marginVertical: 8,
    alignSelf: 'flex-end',
    opacity: 1,
  },
  deleteCompletedText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});