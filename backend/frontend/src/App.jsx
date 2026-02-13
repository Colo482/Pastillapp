import { useState, useEffect } from 'react'
import { 
  Container, Heading, Button, Stack, Box, Text, useToast, Flex, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, ModalFooter,
  List, ListItem, Tabs, TabList, TabPanels, Tab, TabPanel, Select, Divider,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter
} from '@chakra-ui/react'

function App() {
  // --- 1. ESTADOS ---
  const [pedidos, setPedidos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [busqueda, setBusqueda] = useState(""); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  const [sugerencias, setSugerencias] = useState([]);
  const [lineasPedido, setLineasPedido] = useState([{ productoId: "", cantidad: "" }]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");

  const modalPedido = useDisclosure(); 
  const modalPaciente = useDisclosure(); 
  const toast = useToast();

  // --- 2. EFECTOS ---
  useEffect(() => { 
    fetchPedidos(); 
    fetchPacientes(); 
    fetchProductos(); 
  }, []);

  // --- 3. FUNCIONES GET ---
  const fetchProductos = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/productos/');
      const data = await res.json();
      if (Array.isArray(data)) { setProductos(data); } else { setProductos(data.results || []); }
    } catch (e) { console.error(e); }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/pacientes/'); 
      const data = await res.json();
      setPacientes(data); 
    } catch (e) { console.error(e); }
  };

  const fetchPedidos = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/ventas/pedidos/');
      const data = await res.json();
      setPedidos(data);
    } catch (e) { console.error(e); }
  };

  // --- 4. FUNCIONES POST/PATCH ---
  const guardarPedido = async () => {
    if (!pacienteSeleccionado || lineasPedido.some(l => !l.productoId || !l.cantidad)) {
      toast({ title: "Faltan datos", status: "warning" });
      return;
    }
    const datosPedido = {
      paciente: pacienteSeleccionado.id,
      detalles: lineasPedido.map(l => ({
        producto: parseInt(l.productoId),
        cantidad: parseInt(l.cantidad)
      }))
    };
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/ventas/pedidos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosPedido)
      });
      if (res.ok) {
        fetchPedidos(); fetchProductos(); cerrarLimpiarPedido();
        toast({ title: "Venta guardada", status: "success" });
      } else {
        toast({ title: "Error al guardar", status: "error" });
      }
    } catch (e) { console.error(e); }
  };

  const guardarPaciente = async () => {
    const datos = { nombre: nuevoNombre, apellido: nuevoApellido, telefono: nuevoTelefono };
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/pacientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (res.ok) {
        fetchPacientes();
        setNuevoNombre(""); setNuevoApellido(""); setNuevoTelefono("");
        modalPaciente.onClose();
        toast({ title: "Paciente guardado", status: "success" });
      }
    } catch (e) { console.error(e); }
  };

  const actualizarPrecio = async (id, nuevoPrecio) => {
    try {
      const res = await fetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precio_actual: nuevoPrecio })
      });
      if (res.ok) {
        toast({ title: "Precio actualizado", status: "success", duration: 2000 });
        fetchProductos();
      }
    } catch (e) { console.error(e); }
  };

  const actualizarStock = async (id, nuevoStock) => {
    try {
      const res = await fetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(nuevoStock) })
      });
      if (res.ok) {
        toast({ title: "Stock actualizado", status: "success", duration: 2000 });
        fetchProductos();
      }
    } catch (e) { console.error(e); }
  };

  // --- FUNCIÓN PARA COBRAR (MARCAR ENTREGADO) ---
  const marcarComoEntregado = async (id) => {
    try {
      const res = await fetch(`https://pastillapp.onrender.com/api/ventas/pedidos/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagado: true })
      });
      if (res.ok) {
        toast({ title: "Pedido cobrado", status: "success", duration: 2000 });
        fetchPedidos(); 
      }
    } catch (e) { console.error(e); }
  };

  // --- 5. LOGICA UI ---
  const agregarFila = () => setLineasPedido([...lineasPedido, { productoId: "", cantidad: "" }]);
  const eliminarFila = (i) => setLineasPedido(lineasPedido.filter((_, idx) => idx !== i));
  const actualizarFila = (i, campo, val) => {
    const nuevas = [...lineasPedido];
    nuevas[i][campo] = val;
    setLineasPedido(nuevas);
  };
  const cerrarLimpiarPedido = () => {
    setBusqueda(""); setPacienteSeleccionado(null);
    setLineasPedido([{ productoId: "", cantidad: "" }]);
    modalPedido.onClose();
  };

  const actualizarEstadoPedido = async (id, campo, valorActual) => {
  try {
    const res = await fetch(`https://pastillapp.onrender.com/api/ventas/pedidos/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // Aquí enviamos el nombre del campo (pagado o entregado) y su valor opuesto
      body: JSON.stringify({ [campo]: !valorActual }) 
    });
    
    if (res.ok) {
      toast({ 
        title: `Pedido actualizado`, 
        status: "success", 
        duration: 2000 
      });
      fetchPedidos(); // Actualiza la lista para que cambien los colorcitos
    }
  } catch (e) { console.error("Error al actualizar:", e); }
};

  // --- 6. CÁLCULOS AUXILIARES ---
  // Filtramos los pedidos que NO están pagos para el panel derecho
  const pedidosPendientes = pedidos.filter(p => !p.pagado);
  // Filtramos los que NO están pagos (tu código actual)
  const pedidosPendientesPago = pedidos.filter(p => !p.pagado);

// NUEVO: Filtramos los que NO están entregados
  const pedidosPendientesEntrega = pedidos.filter(p => !p.entregado);

  return (
    // CAMBIO: Usamos container.xl para tener más ancho y que entre el panel lateral
    <Container maxW="container.xl" py={10}>
      <Heading color="purple.600" mb={8} textAlign="center">Pastillapp 💊</Heading>

      <Tabs isFitted variant='soft-rounded' colorScheme='purple'>
        <TabList mb='1em'>
          <Tab>📋 Pedidos</Tab>
          <Tab>👥 Pacientes</Tab>
          <Tab>💊 Inventario</Tab>
        </TabList>

        <TabPanels>
          
          {/* --- TAB 1: PANTALLA DIVIDIDA (HISTORIAL + DEUDORES) --- */}
          <TabPanel>
            <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Gestión de Ventas</Text>
              <Button colorScheme="purple" onClick={modalPedido.onOpen}>+ Nueva Venta</Button>
            </Flex>

            {/* Cambiamos a 4 columnas para que el historial sea ancho y los paneles entren bien */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              
              {/* PANEL IZQUIERDO: A ENTREGAR */}
              <Box>
                <Box position="sticky" top="20px">
                  <Card bg="blue.50" borderWidth="1px" borderColor="blue.200" shadow="md">
                    <CardHeader pb={0}>
                      <Heading size="md" color="blue.600">📦 A Entregar</Heading>
                      <Text fontSize="sm" color="blue.400">Pendientes de despacho</Text>
                    </CardHeader>
                    <CardBody>
                      {pedidosPendientesEntrega.length === 0 ? (
                        <Text color="gray.500" fontStyle="italic">Todo entregado. ✨</Text>
                      ) : (
                        <Stack spacing={3}>
                          {pedidosPendientesEntrega.map(p => (
                            <Box key={p.id} p={3} bg="white" borderRadius="md" shadow="sm" borderLeft="4px solid" borderColor="blue.400">
                              <Text fontWeight="bold" fontSize="sm">{p.nombre_paciente}</Text>
                              <Text fontSize="xs" color="gray.600">
                                {p.detalles.map(d => `${d.cantidad}u`).join(" + ")}
                              </Text>
                              <Button size="xs" colorScheme="blue" variant="outline" mt={2} w="full" onClick={() => actualizarEstadoPedido(p.id, 'entregado', p.entregado)}>
                                Marcar Entregado
                              </Button>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </CardBody>
                  </Card>
                </Box>
              </Box>

              {/* COLUMNA CENTRAL (Historial): Ahora ocupa 2 columnas de espacio */}
              <Box gridColumn={{ md: "span 2" }}>
                {/* Aquí va tu Stack con el mapeo de pedidos que corregimos antes */}
              </Box>

              {/* PANEL DERECHO: A COBRAR (Tu panel actual) */}
              <Box>
                <Box position="sticky" top="20px">
                  <Card bg="red.50" borderWidth="1px" borderColor="red.200" shadow="md">
                    <CardHeader pb={0}>
                      <Heading size="md" color="red.600">⚠️ A Cobrar</Heading>
                      <Text fontSize="sm" color="red.400">Cuentas pendientes</Text>
                    </CardHeader>
                    <CardBody>
                      {/* ... resto de tu código de pedidosPendientesPago ... */}
                    </CardBody>
                  </Card>
                </Box>
              </Box>

            </SimpleGrid>
          </TabPanel>

          {/* TAB 2: PACIENTES (Igual que antes) */}
          <TabPanel>
            <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Agenda</Text>
              <Button colorScheme="green" onClick={modalPaciente.onOpen}>+ Nuevo Paciente</Button>
            </Flex>
            <Stack spacing={3}>
              {pacientes.map(p => (
                <Box key={p.id} p={3} borderWidth="1px" borderRadius="lg">
                  <Text fontWeight="bold">{p.apellido}, {p.nombre}</Text>
                  <Text fontSize="xs" color="gray.500">📞 {p.telefono || "---"}</Text>
                </Box>
              ))}
            </Stack>
          </TabPanel>

          {/* TAB 3: INVENTARIO (Igual que antes) */}
          <TabPanel>
            <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Control de Inventario</Text>
            </Flex>
            <Stack spacing={4}>
              {productos.map(p => (
                <Box key={p.id} p={4} shadow="md" borderWidth="1px" borderRadius="xl" bg="white">
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontWeight="bold" fontSize="lg" color="purple.700">{p.get_color_display}</Text>
                    <Badge colorScheme={p.stock > 10 ? "green" : "red"} fontSize="0.9em">{p.stock} Unidades</Badge>
                  </Flex>
                  <Divider mb={3} />
                  <Flex direction="column" gap={3}>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.600" w="80px">Precio ($):</Text>
                      <Flex gap={2}>
                        <Input type="number" defaultValue={p.precio_actual} w="100px" size="sm" id={`precio-${p.id}`} />
                        <Button size="sm" colorScheme="blue" onClick={() => {
                            const val = document.getElementById(`precio-${p.id}`).value;
                            actualizarPrecio(p.id, val);
                        }}>💾</Button>
                      </Flex>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.600" w="80px">Stock (u):</Text>
                      <Flex gap={2}>
                        <Input type="number" defaultValue={p.stock} w="100px" size="sm" id={`stock-${p.id}`} />
                        <Button size="sm" colorScheme="green" onClick={() => {
                            const val = document.getElementById(`stock-${p.id}`).value;
                            actualizarStock(p.id, val);
                        }}>📦</Button>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* MODALES (Igual que antes) */}
      <Modal isOpen={modalPedido.isOpen} onClose={cerrarLimpiarPedido} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargar Nueva Venta</ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Paciente</FormLabel>
                <Input placeholder="Buscar..." value={busqueda} onChange={(e) => {
                  setBusqueda(e.target.value);
                  const filt = pacientes.filter(p => 
                    p.nombre.toLowerCase().includes(e.target.value.toLowerCase()) || 
                    p.apellido.toLowerCase().includes(e.target.value.toLowerCase()));
                  setSugerencias(filt);
                }} />
                {sugerencias.length > 0 && (
                  <List border="1px solid" borderColor="gray.200" borderRadius="md" mt={1} maxH="150px" overflowY="auto" bg="white" position="absolute" width="90%" zIndex={10}>
                    {sugerencias.map(p => (
                      <ListItem key={p.id} p={2} _hover={{ bg: "purple.50", cursor: "pointer" }} onClick={() => {
                        setBusqueda(`${p.apellido}, ${p.nombre}`);
                        setPacienteSeleccionado(p);
                        setSugerencias([]);
                      }}>{p.apellido}, {p.nombre}</ListItem>
                    ))}
                  </List>
                )}
              </FormControl>
              <Divider />
              {lineasPedido.map((linea, index) => (
                <Flex key={index} gap={2}>
                  <Select placeholder="Seleccioná" value={linea.productoId} onChange={(e) => actualizarFila(index, 'productoId', e.target.value)}>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.get_color_display} (${p.precio_actual})</option>)}
                  </Select>
                  <Input type="number" placeholder="Cant." w="80px" value={linea.cantidad} onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)} />
                  {lineasPedido.length > 1 && <Button colorScheme="red" variant="ghost" onClick={() => eliminarFila(index)}>x</Button>}
                </Flex>
              ))}
              <Button size="xs" onClick={agregarFila}>+ Agregar ítem</Button>
              <Box p={4} bg="purple.50" borderRadius="md" borderLeft="4px solid" borderColor="purple.500">
                <Text fontWeight="bold" textAlign="right" color="purple.800">
                  Total a cobrar: ${lineasPedido.reduce((acc, l) => {
                    const prod = productos.find(p => p.id === parseInt(l.productoId));
                    return acc + (prod ? parseFloat(prod.precio_actual) * (parseInt(l.cantidad) || 0) : 0);
                  }, 0)}
                </Text>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={guardarPedido}>Confirmar</Button>
            <Button onClick={cerrarLimpiarPedido}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={modalPaciente.isOpen} onClose={modalPaciente.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Paciente</ModalHeader>
          <ModalBody>
            <Stack spacing={3}>
              <Input placeholder="Nombre" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
              <Input placeholder="Apellido" value={nuevoApellido} onChange={(e) => setNuevoApellido(e.target.value)} />
              <Input placeholder="Teléfono" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={guardarPaciente}>Guardar</Button>
            <Button onClick={modalPaciente.onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default App