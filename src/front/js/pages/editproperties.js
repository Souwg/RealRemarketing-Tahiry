import React, { useState, useEffect } from "react";
import "../../styles/editproperties.css";

export const EditProperties = () => {
  // Estados del componente
  const [properties, setProperties] = useState([]); // Almacena la lista de propiedades
  const [selectedProperty, setSelectedProperty] = useState(null); // Almacena la propiedad seleccionada
  const [editedFields, setEditedFields] = useState({}); // Almacena los campos editados
  const [loading, setLoading] = useState(true); // Indica si se están cargando las propiedades
  const [error, setError] = useState(null); // Almacena errores durante la carga
  const [newField, setNewField] = useState(""); // Almacena el nombre del nuevo campo
  const [newFieldValue, setNewFieldValue] = useState(""); // Almacena el valor del nuevo campo

  // Efecto para cargar las propiedades al montar el componente
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        setProperties(data); // Actualiza el estado con las propiedades obtenidas
      } catch (err) {
        setError(err.message); // Maneja errores
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };
    fetchProperties();
  }, []);

  // Maneja la selección de una propiedad desde el dropdown
  const handleSelectProperty = async (event) => {
    const parcelNumber = event.target.value;
    const property = properties.find((p) => p.parcel_number === parcelNumber);
    if (property) {
      // 1. Obtener los datos actualizados de la propiedad desde el servidor
      try {
        const response = await fetch(
          `http://localhost:3001/api/property/${parcelNumber}`
        );
        if (!response.ok) throw new Error("Failed to fetch property details");
        const updatedProperty = await response.json();

        // 2. Combinar campos principales y adicionales
        const fullProperty = {
          ...updatedProperty,
          ...updatedProperty.additional_data,
        };

        // 3. Actualizar el estado local
        setSelectedProperty(fullProperty);
        setEditedFields(fullProperty);
      } catch (err) {
        console.error("❌ Error fetching property details:", err);
        alert("Error fetching property details: " + err.message);
      }
    }
  };

  // Maneja cambios en los campos del formulario
  const handleFieldChange = (field, value) => {
    setEditedFields((prev) => ({ ...prev, [field]: value })); // Actualiza el campo editado
  };

  // Agrega un nuevo campo dinámico a la propiedad seleccionada
  const handleAddField = async () => {
    if (!newField.trim()) return; // Evita campos vacíos

    try {
      // 1. Enviar la solicitud al servidor para guardar el campo en la base de datos
      const response = await fetch(
        `http://localhost:3001/api/add/property-field/${selectedProperty.parcel_number}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: newField, value: newFieldValue }),
        }
      );

      if (!response.ok) throw new Error("Failed to save new field");

      // 2. Actualizar el estado local con el nuevo campo
      const newFieldData = { [newField]: newFieldValue };
      setSelectedProperty((prev) => ({
        ...prev,
        additional_data: { ...prev.additional_data, ...newFieldData },
      }));
      setEditedFields((prev) => ({ ...prev, ...newFieldData }));

      // 3. Actualizar la lista de propiedades para reflejar el cambio
      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.parcel_number === selectedProperty.parcel_number
            ? {
                ...property,
                additional_data: {
                  ...property.additional_data,
                  ...newFieldData,
                },
              }
            : property
        )
      );

      // 4. Limpiar los inputs después de guardar
      setNewField("");
      setNewFieldValue("");

      alert("✅ New field added and saved successfully!");
    } catch (err) {
      console.error("❌ Error adding new field:", err);
      alert("Error adding the new field: " + err.message);
    }
  };
  // Elimina un campo de la propiedad seleccionada
  const handleDeleteField = async (field, event) => {
    event.preventDefault(); // Evita la recarga de la página
    if (!selectedProperty) return;

    const cleanField = field.trim(); // Normaliza el nombre del campo
    try {
      // 1. Enviar la solicitud al servidor para eliminar el campo
      const response = await fetch(
        `http://localhost:3001/api/delete/property-field/${
          selectedProperty.parcel_number
        }/${encodeURIComponent(cleanField)}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete field");

      // 2. Actualizar el estado local para reflejar la eliminación
      setSelectedProperty((prev) => {
        const updatedData = { ...prev };

        // Eliminar el campo si es un atributo normal de la propiedad (campo principal)
        if (updatedData[cleanField] !== undefined) {
          updatedData[cleanField] = null; // Establecer el campo como null
        }

        // Eliminar el campo si está en additional_data (campo adicional)
        if (
          updatedData.additional_data &&
          cleanField in updatedData.additional_data
        ) {
          delete updatedData.additional_data[cleanField];
        }

        return {
          ...updatedData,
          additional_data: { ...updatedData.additional_data }, // Forzar actualización de React
        };
      });

      // 3. Eliminar el campo de editedFields si existe
      setEditedFields((prev) => {
        const updatedFields = { ...prev };
        if (updatedFields[cleanField] !== undefined)
          delete updatedFields[cleanField];
        return updatedFields;
      });

      alert(`✅ Field '${cleanField}' deleted successfully!`);
    } catch (err) {
      console.error("❌ Error deleting field:", err);
      alert("Error deleting the field: " + err.message);
    }
  };

  // Guarda los cambios realizados en la propiedad seleccionada
  const saveChanges = async () => {
    if (!selectedProperty) return;

    try {
      // 1. Crear un objeto con todos los campos editados (incluyendo additional_data)
      const fieldsToUpdate = { ...editedFields };

      // 2. Enviar la solicitud al servidor para actualizar los campos
      const response = await fetch(
        `http://localhost:3001/api/update/property/${selectedProperty.parcel_number}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fieldsToUpdate),
        }
      );

      if (!response.ok) throw new Error("Failed to update property");

      alert("Property updated successfully!");
    } catch (err) {
      console.error("Error updating property:", err);
      alert("Error updating the property: " + err.message);
    }
  };

  // Elimina una propiedad completa
  const handleDeleteProperty = async (parcelNumber) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/delete/property/${parcelNumber}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete property");
      setProperties((prev) =>
        prev.filter((p) => p.parcel_number !== parcelNumber)
      ); // Elimina la propiedad de la lista
      if (selectedProperty?.parcel_number === parcelNumber)
        setSelectedProperty(null); // Limpia la propiedad seleccionada
      alert("Property deleted successfully!");
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Error deleting the property: " + err.message);
    }
  };

  // Renderizado condicional: Muestra un mensaje de carga o error si es necesario
  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  // Renderizado principal del componente
  return (
    <div className="edit-properties-container">
      {/* 📌 SECCIÓN: Selección de propiedad */}
      <div className="property-selector">
        <label>Select Property:</label>
        <select
          onChange={handleSelectProperty}
          value={selectedProperty?.parcel_number || ""}
        >
          <option value="" disabled>
            -- Select a Property --
          </option>
          {properties.map((property) => (
            <option key={property.parcel_number} value={property.parcel_number}>
              {property.parcel_number} - {property.address}
            </option>
          ))}
        </select>
      </div>

      {/* 📌 TABLA DE PROPIEDADES */}
      {selectedProperty && (
        <div className="table-container">
          <table className="property-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* 📌 CAMPOS ESTÁTICOS */}
              {/* 📌 CAMPOS ESTÁTICOS */}
              {Object.entries(selectedProperty)
                .filter(
                  ([field, value]) =>
                    field !== "additional_data" && // Excluir additional_data
                    !selectedProperty.additional_data?.[field] // Excluir campos dinámicos
                )
                .map(([field, value]) => (
                  <tr key={field}>
                    <td>{field.replace(/_/g, " ").toUpperCase()}</td>
                    <td>
                      <input
                        type="text"
                        value={editedFields[field] ?? value ?? ""}
                        onChange={(e) =>
                          handleFieldChange(field, e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        onClick={(e) => handleDeleteField(field, e)}
                        className="delete-btn"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}

              {/* 📌 CAMPOS DINÁMICOS (additional_data) */}
              {selectedProperty.additional_data &&
                Object.entries(selectedProperty.additional_data)
                  .filter(([field, value]) => value !== null) // 🔥 Filtrar los eliminados
                  .map(([field, value]) => (
                    <tr key={field}>
                      <td>{field.replace(/_/g, " ").toUpperCase()}</td>
                      <td>
                        <input
                          type="text"
                          value={editedFields[field] ?? value ?? ""}
                          onChange={(e) =>
                            handleFieldChange(field, e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          onClick={(e) => handleDeleteField(field, e)}
                          className="delete-btn"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 SECCIÓN: Agregar nuevos campos */}
      <div className="add-new-field">
        <input
          type="text"
          placeholder="New field name"
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
        />
        <input
          type="text"
          placeholder="Value"
          value={newFieldValue}
          onChange={(e) => setNewFieldValue(e.target.value)}
        />
        <button onClick={handleAddField}>➕ Add</button>
      </div>

      {/* 📌 BOTONES DE ACCIÓN */}
      <div className="button-container">
        <button
          onClick={() => handleDeleteProperty(selectedProperty.parcel_number)}
          className="delete-property-btn"
        >
          ❌ Delete Property
        </button>
        <button onClick={saveChanges} className="save-btn">
          💾 Save Changes
        </button>
      </div>
    </div>
  );
};
