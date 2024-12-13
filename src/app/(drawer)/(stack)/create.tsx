// Importaciones necesarias para crear la interfaz, manejar estados y gestionar la navegación.
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { Subforum } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { router } from "expo-router";
import { submitSub, fetchUsers } from "@/lib/utils/api";
import ColorPicker from "react-native-wheel-color-picker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/utils/supabase";

export default function CreateSub() {
  // Declaración de los estados locales para los distintos campos de entrada y control de la vista.
  const [name, setName] = useState(""); // Nombre del subforo
  const [description, setDescription] = useState(""); // Descripción del subforo
  const [accent, setAccent] = useState("#ff0000"); // Color de acento para el subforo
  const [moderators, setModerators] = useState<string[]>([]); // Lista de moderadores seleccionados
  const [modalVisible, setModalVisible] = useState(false); // Controla si el modal para seleccionar moderadores está visible
  const [searchQuery, setSearchQuery] = useState(""); // Consulta de búsqueda para los usuarios
  const [users, setUsers] = useState([]); // Lista de usuarios disponibles para ser seleccionados como moderadores
  const { user } = useAuth(); // Obtiene el usuario autenticado
  const { height } = Dimensions.get("window"); // Obtiene la altura de la pantalla del dispositivo

  // Función que maneja el envío de los datos del nuevo subforo
  const handleSubmit = async () => {
    // Verificación de que los campos no estén vacíos
    if (name.trim() === "" || description.trim() === "") {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return; // No proceder con el envío si algún campo está vacío
    }

    // Crea un objeto subforo con los datos actuales
    const sub: Subforum = {
      name,
      description,
      created_at: new Date().toISOString(),
      accent,
      created_by: user.id, // El subforo es creado por el usuario autenticado
    };

    try {
      submitSub(sub).then(async (data) => {
        const subId = data.id; // Obtiene el ID del subforo recién creado
        const moderatorIds = moderators.map((username) => {
          // Mapea los nombres de los moderadores a sus respectivos IDs
          const user = users.find((user) => user.username === username);
          return user.id;
        });

        if (moderatorIds.length > 0) {
          // Si hay moderadores seleccionados, los agrega a la tabla "moderators"
          const moderatorsData = moderatorIds.map((user_id) => ({
            sub_id: subId,
            user_id: user_id,
          }));

          const { error: moderatorsError } = await supabase
            .from("moderators")
            .insert(moderatorsData);

          if (moderatorsError) {
            console.error(
              "Error insertando moderadores:",
              moderatorsError.message,
            );
            Alert.alert("Error", "Hubo un error al añadir moderadores.");
            return;
          }
        }

        Alert.alert("Éxito", "Su subforo ha sido creado.");
        router.replace(`/home`); // Redirige al usuario a la página principal
      });
    } catch (error) {
      Alert.alert("Error", "Hubo un error al enviar el subforo.");
    }
  };

  // Abre el modal para añadir moderadores
  const handleAddMods = () => {
    setModalVisible(true); // Muestra el modal
    fetchAvailableUsers(); // Recupera la lista de usuarios disponibles para moderadores
  };

  // Función que recupera los usuarios desde la API
  const fetchAvailableUsers = async () => {
    try {
      const data = await fetchUsers(); // Recupera la lista de usuarios desde la API
      setUsers(data);
    } catch (error) {
      Alert.alert("Error", "Error al recuperar usuarios.");
    }
  };

  // Actualiza el valor de búsqueda de usuarios
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Filtra los usuarios según la búsqueda realizada
  const filteredUsers = users.filter((u: any) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Agrega un moderador a la lista si no está ya incluido
  const addModerator = (username: string) => {
    if (!moderators.includes(username)) {
      setModerators((prev) => [...prev, username]);
    }
  };

  // Elimina un moderador de la lista
  const removeModerator = (username: string) => {
    setModerators((prev) => prev.filter((mod) => mod !== username));
  };

  return (
    // Se cierra el teclado al hacer clic fuera de los campos de texto
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white h-full pb-4">
        <View className="flex-1 px-4 ">
          <Text className="text-3xl font-bold mb-4">Crea un nuevo subforo</Text>
          <TextInput
            className="border border-gray-300 p-3 mb-4 rounded"
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            className="border border-gray-300 p-3 mb-4 rounded h-40 text-gray-800"
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View className="px-6">
            {/* Componente para elegir el color de acento del subforo */}
            <ColorPicker
              color={accent}
              onColorChange={(color) => {
                setAccent(color); // Actualiza el color seleccionado
              }}
              thumbSize={50}
              swatchesOnly={true}
              swatchesLast={true}
              sliderSize={30}
              noSnap={true}
              swatches={true}
              row={false}
            />
            <View className="flex-1 items-center">
              <View
                className={`w-20 h-20 mt-10 rounded-lg`}
                style={{ backgroundColor: accent }} // Muestra el color seleccionado
              />
            </View>
          </View>
        </View>

        {/* Muestra los moderadores seleccionados */}
        <View className="mx-4">
          {moderators.length > 0 && (
            <View className="bg-gray-100 p-3 rounded mb-4">
              <Text className="font-bold mb-2">Selecciona moderadores: </Text>
              {moderators.map((mod, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center mb-2"
                >
                  <Text className="text-lg">{mod}</Text>
                  <TouchableOpacity onPress={() => removeModerator(mod)}>
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color="red"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botones para añadir moderadores o enviar el subforo */}
        <View className="mt-auto mx-4 mb-20">
          <TouchableOpacity
            onPress={handleAddMods}
            className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center"
          >
            <Text className="text-xl font-bold text-white">
              Añadir moderador/es
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            className="rounded-xl my-2 p-4 bg-green-500 flex justify-center items-center"
          >
            <Text className="text-xl font-bold text-white">Enviar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal para añadir moderadores */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
          transparent={true} // Hace que el fondo del modal sea transparente
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end", // Alinea el contenido del modal al fondo
            }}
          >
            <View
              style={{
                height: height * 0.8, // Establece la altura del modal al 80% de la pantalla
                backgroundColor: "white",
                borderTopLeftRadius: 20, // Agrega esquinas redondeadas arriba
                borderTopRightRadius: 20,
                padding: 16,
                borderWidth: 2,
                borderColor: "gray",
              }}
            >
              <TextInput
                className="border border-gray-300 p-3 mb-4 rounded"
                placeholder="Buscar usuarios"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {/* Lista de usuarios filtrados según la búsqueda */}
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View className="flex-row justify-between items-center border-b border-gray-200 p-3">
                    <Text className="text-lg">{item.username}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        moderators.includes(item.username)
                          ? removeModerator(item.username)
                          : addModerator(item.username)
                      }
                    >
                      <Ionicons
                        name={
                          moderators.includes(item.username)
                            ? "remove-circle-outline"
                            : "add-circle-outline"
                        }
                        size={24}
                        color={
                          moderators.includes(item.username) ? "red" : "blue"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <Text className="text-gray-500 text-center mt-4">
                    No se encontraron usuarios.
                  </Text>
                }
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mt-4 p-4 rounded-xl bg-red-500 flex items-center"
              >
                <Text className="text-white font-bold text-lg">Hecho</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
