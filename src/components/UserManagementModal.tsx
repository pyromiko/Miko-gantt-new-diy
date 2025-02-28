import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { User } from '../types';
import { X, UserPlus, UserMinus } from 'lucide-react';

interface UserManagementModalProps {
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const { users, addUser, removeUser } = useProjectStore();
  const [newUser, setNewUser] = useState({ name: '', avatar: '' });

  const handleAddUser = () => {
    if (newUser.name.trim()) {
      const user: User = {
        id: Math.random().toString(),
        name: newUser.name,
        avatar: newUser.avatar,
      };
      addUser(user);
      setNewUser({ name: '', avatar: '' });
    } else {
      alert('Please enter a user name.');
    }
  };

  const handleRemoveUser = (userId: string) => {
    removeUser(userId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Manage Users</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center space-x-4">
            <input
              type="text"
              placeholder="User Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md w-1/2 text-gray-800"
            />
            <input
              type="text"
              placeholder="Avatar URL (optional)"
              value={newUser.avatar}
              onChange={(e) => setNewUser({ ...newUser, avatar: e.target.value })}
              className="px-3 py-2 border rounded-md w-1/2 text-gray-800"
            />
            <button
              onClick={handleAddUser}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <UserPlus className="h-5 w-5 inline-block mr-1" />
              Add User
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Current Users</h3>
            <ul className="space-y-2">
              {users.map(user => (
                <li key={user.id} className="flex items-center justify-between bg-white rounded-md shadow-sm p-3">
                  <div className="flex items-center space-x-3 text-gray-800">
                    {user.avatar && <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />}
                    <span>{user.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    <UserMinus className="h-5 w-5 inline-block mr-1" />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
