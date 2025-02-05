import React, { useState, useEffect } from "react";
import axios from "axios";
import Confetti from 'react-confetti';
import { Howl } from 'howler';

const Url = process.env.REACT_APP_API_URL || "http://localhost:5000";
const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("personal");
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState({
    firstTask: false,
    fiveTasks: false,
    allComplete: false
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const completedCount = todos.filter(todo => todo.completed).length;
    const total = todos.length;
    
    setAchievements({
      firstTask: completedCount >= 1,
      fiveTasks: completedCount >= 5,
      allComplete: total > 0 && completedCount === total
    });
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${Url}/api/todos`);
      setTodos(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const playSound = (soundFile) => {
    new Howl({
      src: [soundFile],
      volume: 0.3
    }).play();
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const response = await axios.post(`${Url}/api/todos`, {
        text,
        category
      });
      setTodos([response.data, ...todos]);
      setText("");
      playSound('/sounds/complete.mp3');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${Url}/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
      playSound('/sounds/delete.mp3');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTodo = async (id) => {
    try {
      await axios.patch(`${Url}/api/todos/${id}`);
      const updatedTodos = todos.map(todo => 
        todo._id === id ? { ...todo, completed: !todo.completed } : todo
      );
      setTodos(updatedTodos);
      
      if (!todos.find(todo => todo._id === id)?.completed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completionPercentage = todos.length > 0 
    ? Math.round((todos.filter(todo => todo.completed).length / todos.length) * 100)
    : 0;

  return (
    <div className="todo-container">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <h1>Todo List</h1>

      <div className="progress-circle">
        <svg viewBox="0 0 100 100">
          <circle className="background" cx="50" cy="50" r="45" />
          <circle 
            className="progress" 
            cx="50" 
            cy="50" 
            r="45"
            strokeDasharray={`${283 * (completionPercentage/100)} 283`}
          />
        </svg>
        <div className="progress-text">{completionPercentage}%</div>
      </div>

      <div className="badges-container">
        <div className={`badge ${achievements.firstTask ? 'active' : ''}`}>
          ⭐ First Task!
        </div>
        <div className={`badge ${achievements.fiveTasks ? 'active' : ''}`}>
          🏆 5 Completed
        </div>
        <div className={`badge ${achievements.allComplete ? 'active' : ''}`}>
          🎯 All Done!
        </div>
      </div>

      <form onSubmit={addTodo}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new todo..."
        />
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="personal">Personal 🌟</option>
          <option value="work">Work 💼</option>
          <option value="shopping">Shopping 🛒</option>
        </select>
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo._id} data-category={todo.category}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo._id)}
            />
            <span className={todo.completed ? "completed" : ""}>
              {todo.text}
            </span>
            <button 
              className="delete-btn"
              onClick={() => deleteTodo(todo._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;