import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const AUTO_DELETE_SECONDS = 10;

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('Lista tus tareas aquí');
  const [messageColor, setMessageColor] = useState('#007AFF');
  const [filter, setFilter] = useState('Todas'); // Nueva variable de filtro
  const timerRef = useRef(null);

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
    } else if (tasks.length >= 4) {
      setMessage(`Total de tareas: ${tasks.length}`);
      setMessageColor('orange');
    } else if (tasks.length >= 1) {
      setMessage(`Total de tareas: ${tasks.length}`);
      setMessageColor('green');
    } else {
      setMessage('Lista tus tareas aquí');
      setMessageColor('#007AFF');
    }
  }, [tasks]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tasks.some(t => t.completed)) {
      timerRef.current = setTimeout(() => {
        setTasks(prev => prev.filter(t => !t.completed));
      }, AUTO_DELETE_SECONDS * 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [tasks]);

  const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);

  const filteredTasks = sortedTasks.filter(t => {
    if (filter === 'Todas') return true;
    if (filter === 'Pendientes') return !t.completed;
    if (filter === 'Completadas') return t.completed;
    return true;
  });

  const handleAddTask = () => {
    if (task.trim() === '') {
      setMessage('La tarea no puede estar vacía');
      setMessageColor('red');
      return;
    }
    // Validar duplicados (ignorando mayúsculas/minúsculas y espacios)
    const normalizedTask = task.trim().toLowerCase();
    if (tasks.some(t => t.text.trim().toLowerCase() === normalizedTask)) {
      setMessage('La tarea ya existe');
      setMessageColor('red');
      return;
    }
    setTasks([
      ...tasks,
      {
        key: Date.now().toString(),
        text: task,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
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

  // Formatear fecha y hora
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
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
      {/* Filtro dinámico */}
      <View style={styles.filterContainer}>
        {['Todas', 'Pendientes', 'Completadas'].map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && styles.filterBtnActive
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={filter === f ? styles.filterTextActive : styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
        data={filteredTasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => handleToggleComplete(item.key)} style={{ flex: 1 }}>
              <Text style={item.completed ? styles.completedText : null}>
                {item.text}
              </Text>
              {/* Fecha y hora de creación */}
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item.key)}>
              <Text style={styles.deleteButton}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
      />
      <Text style={styles.timerText}>
        Las tareas completadas se eliminarán automáticamente en {AUTO_DELETE_SECONDS} segundos
      </Text>
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
  filterContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  timerText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
});