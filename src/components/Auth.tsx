import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, View, Text, Image } from "react-native";
import { supabase } from "@/lib/utils/supabase";
import { Button, Input, Switch } from "@rneui/themed";

export const BLACK_LOGO_URL =
  "https://syhqbeqnshfljqbkoubc.supabase.co/storage/v1/object/sign/extras/logos/black%20Consulting%20Company%20Logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJleHRyYXMvbG9nb3MvYmxhY2sgQ29uc3VsdGluZyBDb21wYW55IExvZ28ucG5nIiwiaWF0IjoxNzMzOTM4ODA5LCJleHAiOjQ4ODc1Mzg4MDl9.ZRMJ1Du7vrNxbD_yDL46AxqTZGJLFBP1WeXiH3_NQeY&t=2024-12-11T17%3A40%3A09.589Z";
export const BLUE_LOGO_URL =
  "https://syhqbeqnshfljqbkoubc.supabase.co/storage/v1/object/sign/extras/logos/Blue%20Consulting%20Company%20Logo(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJleHRyYXMvbG9nb3MvQmx1ZSBDb25zdWx0aW5nIENvbXBhbnkgTG9nbygxKS5wbmciLCJpYXQiOjE3MzM5Mzg4MzAsImV4cCI6NDg4NzUzODgzMH0._9p95e2rXw0_DYJaCAr3qAX3PZdO3Fm4xsN_UOhN8QY&t=2024-12-11T17%3A40%3A30.427Z";
export const WHITE_LOGO_URL =
  "https://syhqbeqnshfljqbkoubc.supabase.co/storage/v1/object/sign/extras/logos/white%20Consulting%20Company%20Logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJleHRyYXMvbG9nb3Mvd2hpdGUgQ29uc3VsdGluZyBDb21wYW55IExvZ28ucG5nIiwiaWF0IjoxNzMzOTM4ODgxLCJleHAiOjQ4ODc1Mzg4ODF9.wBywyYdGCe8m6CYHguaZvSdZDPTAOJLECNcXsjO9fSY&t=2024-12-11T17%3A41%3A21.593Z";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [passwordError, setPasswordError] = useState(true);

  // Función para iniciar sesión con email y contraseña
  const signInWithEmail = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);
    if (error) {
      Alert.alert(error.message);
      return;
    }
    router.push("/home"); // Redirige al usuario a la pantalla de inicio después de iniciar sesión
    setTimeout(() => {
      router.replace("/home"); // Reemplaza la pantalla actual con la de inicio
    }, 0);
  };

  // Función para registrar un nuevo usuario con email y contraseña
  const signUpWithEmail = async () => {
    setLoading(true);
    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (user) {
      // Inserta al usuario en la tabla de usuarios de la base de datos
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id, // Usa el ID del usuario desde Supabase auth
          username: username,
          email: email,
        },
      ]);

      if (insertError) {
        Alert.alert(insertError.message);
      } else {
        Alert.alert(
          "Por favor, compruebe su bandeja de entrada para confirmar su email.",
        ); // Informa al usuario que confirme su correo electrónico
      }

      setLoading(false);
    }
  };

  // Función que decide si se debe registrar o iniciar sesión según el estado de 'isEnabled'
  const clickButton = () => {
    !isEnabled ? signUpWithEmail() : signInWithEmail(); // Si no está habilitado, registra, de lo contrario, inicia sesión
  };

  // Función que valida la contraseña con una expresión regular
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,!?])[A-Za-z\d!@#$%^&*.,!?]{9,}$/;
    setPasswordError(!passwordRegex.test(password)); // Establece si la contraseña es válida
  };

  return (
    <View className="flex h-screen">
      <View className="w-full px-4 m-auto h-screen">
        {/* Muestra el logo de la empresa */}
        <Image
          className="max-w-md mx-auto w-[250px] h-[250px] rounded-[25px] mb-5 mt-16"
          src={WHITE_LOGO_URL}
          style={{
            resizeMode: "cover", // Ajusta la imagen para que se cubra correctamente
          }}
        />
        {/* Si no estamos en modo "Iniciar sesión", mostramos el campo de nombre de usuario */}
        {!isEnabled && (
          <View className="mb-4 relative">
            <Input
              label="Nombre de usuario"
              leftIcon={{ type: "font-awesome", name: "user" }}
              onChangeText={(text) => setUsername(text)} // Actualiza el estado del nombre de usuario
              value={username} // Muestra el valor actual del nombre de usuario
              placeholder="Nombre de usuario"
              autoCapitalize={"none"}
              inputContainerStyle={{ borderBottomColor: "#ccc" }}
              labelStyle={{ color: "#555" }}
              inputStyle={{ color: "#333" }}
            />
          </View>
        )}
        {/* Campo de entrada para el correo electrónico */}
        <View className="mb-4">
          <Input
            label="Email"
            leftIcon={{ type: "font-awesome", name: "envelope" }}
            onChangeText={(text) => setEmail(text)} // Actualiza el estado del email
            value={email} // Muestra el valor actual del email
            placeholder="email@correo.com"
            autoCapitalize={"none"}
            inputContainerStyle={{ borderBottomColor: "#ccc" }}
            labelStyle={{ color: "#555" }}
            inputStyle={{ color: "#333" }}
          />
        </View>
        {/* Campo de entrada para la contraseña */}
        <View className="mb-2">
          <Input
            label="Contraseña"
            leftIcon={{ type: "font-awesome", name: "lock" }}
            onChangeText={(text) => {
              setPassword(text);
              validatePassword(text); // Valida la contraseña al cambiar
            }}
            value={password} // Muestra el valor actual de la contraseña
            secureTextEntry={true} // Oculta el texto de la contraseña
            placeholder="Contraseña"
            autoCapitalize={"none"}
            inputContainerStyle={{
              borderBottomColor: !passwordError ? "#ccc" : "#c11",
            }}
            labelStyle={{ color: "#555" }}
            inputStyle={{ color: "#333" }}
          />
        </View>
        {/* Muestra un mensaje de error si la contraseña no es válida */}
        {passwordError && !isEnabled && (
          <Text className="text-red-500 text-xs mb-2">
            Las contraseñas deben tener una letra mayúscula, un número, un
            carácter especial y al menos 9 carácteres
          </Text>
        )}
        {/* Botón para registrar o iniciar sesión */}
        <View>
          <Button
            title={!isEnabled ? "Registrarse" : "Iniciar sesión"}
            disabled={loading || (passwordError && !isEnabled)} // Desactiva el botón si está cargando o la contraseña es inválida
            onPress={() => clickButton()} // Llama a la función para iniciar sesión o registrarse
            buttonStyle={
              !isEnabled
                ? { backgroundColor: "#2196F3" }
                : { backgroundColor: "#22C55E" }
            }
            containerStyle={{ borderRadius: 8 }}
          />
        </View>
        {/* Switch para cambiar entre registro e inicio de sesión */}
        <View className="m-auto flex-row items-center justify-between mt-4">
          <Text className="mr-2">Registrarse</Text>
          <Switch
            value={isEnabled} // Controla el valor del Switch
            onValueChange={() => setIsEnabled((e) => !e)} // Cambia entre registro e inicio de sesión
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
          />
          <Text className="ml-2">Iniciar sesión</Text>
        </View>
      </View>
    </View>
  );
}
