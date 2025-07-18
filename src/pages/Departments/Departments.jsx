import React, { useEffect, useState } from "react";
import { departmentsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const DepartmentForm = ({ onSubmit, loading, initial, employees }) => {
  const [form, setForm] = useState(initial || { name: "", head: "" });

  useEffect(() => {
    setForm(initial || { name: "", head: "" });
  }, [initial]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          className="input-field"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Head
        </label>
        <select
          className="input-field"
          value={form.head || ""}
          onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))}
        >
          <option value="">None</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <LoadingSpinner size="small" /> : "Save"}
        </button>
      </div>
    </form>
  );
};

const Departments = () => {
  const { hasPermission } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data.data);
    } catch {
      toast.error("Failed to fetch departments");
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const res = await import("../../services/api").then((m) =>
        m.employeesAPI.getAll({ limit: 100 })
      );
      setEmployees(res.data.data.employees || []);
    } catch {}
  };

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await departmentsAPI.create(data);
      toast.success("Department created");
      setFormOpen(false);
      fetchDepartments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create department");
    }
    setFormLoading(false);
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await departmentsAPI.update(editDept._id, data);
      toast.success("Department updated");
      setEditDept(null);
      setFormOpen(false);
      fetchDepartments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update department");
    }
    setFormLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await departmentsAPI.delete(id);
      toast.success("Department deleted");
      fetchDepartments();
    } catch (e) {
      toast.error("Failed to delete department");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        {hasPermission("create_department") && (
          <button
            className="btn-primary"
            onClick={() => {
              setFormOpen(true);
              setEditDept(null);
            }}
          >
            Add Department
          </button>
        )}
      </div>

      {formOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <DepartmentForm
            onSubmit={editDept ? handleUpdate : handleCreate}
            loading={formLoading}
            initial={editDept}
            employees={employees}
          />
          <button
            className="btn-secondary mt-2"
            onClick={() => {
              setFormOpen(false);
              setEditDept(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Head
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employees
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept._id}>
                <td className="px-6 py-4">{dept.name}</td>
                <td className="px-6 py-4">
                  {employees.find((e) => e._id === dept.head)
                    ? `${
                        employees.find((e) => e._id === dept.head).personalInfo
                          .firstName
                      } ${
                        employees.find((e) => e._id === dept.head).personalInfo
                          .lastName
                      }`
                    : "—"}
                </td>
                <td className="px-6 py-4">{dept.employees?.length || 0}</td>
                <td className="px-6 py-4 flex gap-2">
                  {hasPermission("update_department") && (
                    <button
                      className="btn-secondary flex items-center gap-1"
                      onClick={() => {
                        setEditDept(dept);
                        setFormOpen(true);
                      }}
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                  {hasPermission("delete_department") && (
                    <button
                      className="btn-danger flex items-center gap-1"
                      onClick={() => handleDelete(dept._id)}
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Departments;
