import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import axios from "axios";
import "./styles.css";
const API_URL = "https://jsonplaceholder.typicode.com/photos";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [photos, setPhotos] = useState([]);
  /* `useEffect` es un gancho en React que le permite realizar efectos secundarios en componentes
  funcionales. En este caso, está obteniendo datos de una API usando Axios y configurando el estado
  de las "fotos" con los datos mapeados. El segundo argumento `[]` significa que este efecto solo se
  ejecutará una vez, cuando se monte el componente. */
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(API_URL);
        const photoInfo = response.data;

        // Mapea los datos para crear la estructura deseada |photo|
        const mappedData = photoInfo.map((photo) => ({
          albumId: photo.albumId,
          id: photo.id,
          thumbnailUrl: photo.thumbnailUrl,
          title: photo.title,
          url: photo.url,
        }));

        setPhotos(mappedData);
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    fetchPhotos();
  }, []);

  /**
   * Esta función agrega un nuevo componente móvil con propiedades aleatorias y una imagen de una
   * lista.
   */
  const addMoveable = () => {
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        // Asigna una imagen aleatoria de la lista de fotos
        ...photos[Math.floor(Math.random() * photos.length)],
        updateEnd: true,
      },
    ]);
  };

  /**
   * Esta función actualiza un componente móvil en una matriz de componentes móviles.
   * @param id - El id del componente móvil que necesita ser actualizado.
   * @param newComponent - `newComponent` es un objeto que contiene las propiedades actualizadas para
   * un componente móvil específico. Estas propiedades reemplazarán las propiedades existentes del
   * componente móvil con el 'id' correspondiente.
   * @param [updateEnd=false] - `updateEnd` es un parámetro booleano que es opcional y por defecto es
   * `falso`. Se utiliza para indicar si el componente móvil ha terminado o no de actualizarse. Si
   * `updateEnd` se establece en `true`, puede desencadenar acciones o comportamientos adicionales en
   * el código que dependen del móvil.
   */
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  /**
   * Esta función elimina un componente móvil de una matriz en función de su ID y actualiza el estado
   * con la matriz filtrada.
   * @param id - El ID del componente móvil que debe eliminarse de la matriz `moveableComponents`. La
   * función filtra la matriz para eliminar el elemento con el ID coincidente y actualiza el estado con
   * la matriz filtrada.
   */
  const deleteMoveable = (id) => {
    // Filtrar el array y eliminar el elemento con el ID correspondiente
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== id
    );
    // Actualizar el estado con el array filtrado
    setMoveableComponents(updatedMoveables);
  };
  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button className="button-add" onClick={addMoveable}>
        Add Moveable1
      </button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "#ecf0f3",
          height: "80vh",
          width: "80vw",
          overflow: "hidden",
        }}
      >
        {moveableComponents.map((item, index) => (
          <>
            <button
              className="button-delete"
              onClick={() => deleteMoveable(item.id)}
            >
              Eliminar
            </button>
            <Component
              {...item}
              key={index}
              updateMoveable={updateMoveable}
              setSelected={setSelected}
              isSelected={selected === item.id}
            />
          </>
        ))}
      </div>
    </main>
  );
};

export default App;
const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  thumbnailUrl,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  console.log({
    updateMoveable,
    top,
    left,
    width,
    height,
    index,
    thumbnailUrl,
    id,
    setSelected,
    updateEnd,
  });
  const ref = useRef();

  return (
    <div>
      <div
        ref={ref}
        id={"component-" + id}
        className="draggable"
        style={{
          position: "relative",
          top: top,
          left: left,
          width: width,
          height: height,
          background: `url(${thumbnailUrl})`,
          backgroundSize: "cover",
          overflow: "hidden",
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        snappable={true}
        resizable={true}
        keepRatio={false}
        throttleResize={1}
        draggable
        edge={false}
        zoom={1}
        origin={false}
        onDrag={(e) => {
          /* `updateMoveable` es una función que se pasa como accesorio al componente `Component`. Se
          usa para actualizar la posición y el tamaño del componente cuando se arrastra o cambia de
          tamaño usando la biblioteca `Moveable`. */
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            thumbnailUrl,
          });
        }}
        onResize={(e) => {
          /*
        Se reemplazo la funcion proporcionada por la funcionalidad que nos da la misma libreria
          
        Este código está actualizando los estilos CSS del elemento de destino cuyo tamaño cambia el
         componente Moveable. Establece el ancho y el alto del elemento en los nuevos valores de
         ancho y alto proporcionados por el evento `onResize`, y establece la propiedad de
         transformación del elemento en el nuevo valor de transformación proporcionado por la
         propiedad `e.drag.transform`. Esto garantiza que el elemento cambie de tamaño y se coloque
         correctamente en función de la interacción del usuario con el componente movible. */
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.drag.transform;
        }}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </div>
  );
};
