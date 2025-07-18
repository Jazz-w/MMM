import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersAPI } from "../api";
import { User } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PermissionsManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'customer') => {
    try {
      await usersAPI.update(userId, { role });
      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch = 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Permissions</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 rounded-md border"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      <ul className="space-y-2">
        {filteredUsers.map((user) => (
          <li
            key={user.id}
            className="bg-card rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="ml-4">
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin' 
                    ? 'bg-red-500/20 text-red-500' 
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {user.role}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsDialogOpen(true);
                  }}
                >
                  Manage Role
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  variant={selectedUser.role === 'admin' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                >
                  Admin
                </Button>
                <Button
                  variant={selectedUser.role === 'customer' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleRoleChange(selectedUser.id, 'customer')}
                >
                  Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 