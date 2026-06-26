import { useState, useEffect } from 'react'
import { 
  Container, Heading, Button, Stack, Box, Text, useToast, Flex, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, ModalFooter,
  List, ListItem, Tabs, TabList, TabPanels, Tab, TabPanel, Select, Divider,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, RadioGroup, Radio, Checkbox
} from '@chakra-ui/react'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function App() {
  // --- 1. ESTADOS Y AUTENTICACIÓN ---
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [pedidos, setPedidos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [gastos, setGastos] = useState([]); 
  
  const [busqueda, setBusqueda] = useState(""); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  const [sugerencias, setSugerencias] = useState([]);
  const [lineasPedido, setLineasPedido] = useState([{ productoId: "", cantidad: "" }]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  
  // Estados para Billetera
  const [nuevoGasto, setNuevoGasto] = useState({ nombre: "", descripcion: "", monto: "", tipo: "EGRESO", categoria: "OTROS" });
  const [gastoEditando, setGastoEditando] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]); 
  const [tipoGrafico, setTipoGrafico] = useState('torta');

  const modalPedido = useDisclosure(); 
  const modalPaciente = useDisclosure(); 
  const modalGasto = useDisclosure();
  const toast = useToast();

  // --- 2. FUNCION AUTH FETCH ---
  const authFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) { 
      setToken(null); 
      localStorage.removeItem('token'); 
      toast({ title: "Sesión expirada, inicia sesión de nuevo", status: "error" });
      throw new Error("No autorizado");
    }
    return res;
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('https://pastillapp.onrender.com/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access);
        localStorage.setItem('token', data.access);
        toast({ title: "Bienvenido", status: "success" });
      } else {
        toast({ title: "Usuario o contraseña incorrectos", status: "error" });
      }
    } catch (e) { console.error(e); }
  };

  // --- 3. EFECTOS ---
  useEffect(() => { 
    if (token) {
      fetchPedidos(); fetchPacientes(); fetchProductos(); fetchGastos();
    }
  }, [token]);

  // --- 4. FUNCIONES GET ---
  const fetchProductos = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/productos/');
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : (data.results || []));
    } catch (e) { console.error(e); }
  };

  const fetchPacientes = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/pacientes/'); 
      const data = await res.json();
      setPacientes(data); 
    } catch (e) { console.error(e); }
  };

  const fetchPedidos = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/ventas/pedidos/');
      const data = await res.json();
      setPedidos(data);
    } catch (e) { console.error(e); }
  };

  const fetchGastos = async () => {
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/gastos/movimientos/');
      const data = await res.json();
      setGastos(data);
    } catch (e) { console.error(e); }
  };

  // --- 5. FUNCIONES DE ACTUALIZACIÓN PASTILLAS ---
  const actualizarEstadoPedido = async (id, campo, valorActual) => {
    try {
      const res = await authFetch(`https://pastillapp.onrender.com/api/ventas/pedidos/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ [campo]: !valorActual }) 
      });
      if (res.ok) {
        toast({ title: `Pedido actualizado`, status: "success", duration: 2000 });
        fetchPedidos();
      }
    } catch (e) { console.error("Error al actualizar:", e); }
  };

  const actualizarPrecio = async (id, nuevoPrecio) => {
    try {
      const res = await authFetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
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
      const res = await authFetch(`https://pastillapp.onrender.com/api/productos/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: parseInt(nuevoStock) })
      });
      if (res.ok) {
        toast({ title: "Stock actualizado", status: "success", duration: 2000 });
        fetchProductos();
      }
    } catch (e) { console.error(e); }
  };

  // --- 6. FUNCIONES POST ---
  const guardarPedido = async () => {
    const datosPedido = {
      paciente: pacienteSeleccionado.id,
      detalles: lineasPedido.map(l => ({ producto: parseInt(l.productoId), cantidad: parseInt(l.cantidad) }))
    };
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/ventas/pedidos/', {
        method: 'POST',
        body: JSON.stringify(datosPedido)
      });
      if (res.ok) {
        fetchPedidos(); fetchProductos(); cerrarLimpiarPedido();
        toast({ title: "Venta guardada", status: "success" });
      }
    } catch (e) { console.error(e); }
  };

  const guardarPaciente = async () => {
    const datos = { nombre: nuevoNombre, apellido: nuevoApellido, telefono: nuevoTelefono };
    try {
      const res = await authFetch('https://pastillapp.onrender.com/api/pacientes/', {
        method: 'POST',
        body: JSON.stringify(datos)
      });
      if (res.ok) {
        fetchPacientes(); setNuevoNombre(""); setNuevoApellido(""); setNuevoTelefono("");
        modalPaciente.onClose();
        toast({ title: "Paciente guardado", status: "success" });
      }
    } catch (e) { console.error(e); }
  };

  // --- 7. LÓGICA DE BILLETERA (CRUD) ---
  const abrirModalGasto = (gasto = null) => {
    if (gasto) {
      setGastoEditando(gasto.id);
      setNuevoGasto({ nombre: gasto.nombre, descripcion: gasto.descripcion || "", monto: gasto.monto, tipo: gasto.tipo, categoria: gasto.categoria });
    } else {
      setGastoEditando(null);
      setNuevoGasto({ nombre: "", descripcion: "", monto: "", tipo: "EGRESO", categoria: "OTROS" });
    }
    modalGasto.onOpen();
  };

  const guardarGasto = async () => {
    try {
      const url = gastoEditando 
        ? `https://pastillapp.onrender.com/api/gastos/movimientos/${gastoEditando}/`
        : 'https://pastillapp.onrender.com/api/gastos/movimientos/';
      const method = gastoEditando ? 'PATCH' : 'POST';

      const res = await authFetch(url, {
        method: method,
        body: JSON.stringify(nuevoGasto)
      });
      if (res.ok) {
        fetchGastos(); modalGasto.onClose();
        toast({ title: `Movimiento ${gastoEditando ? 'actualizado' : 'guardado'}`, status: "success" });
      } else {
        toast({ title: "Error al guardar", status: "error" });
      }
    } catch (e) { console.error(e); }
  };

  const eliminarGasto = async (id) => {
    if(!window.confirm("¿Seguro que quieres borrar este movimiento?")) return;
    try {
      const res = await authFetch(`https://pastillapp.onrender.com/api/gastos/movimientos/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        fetchGastos();
        setSeleccionados(seleccionados.filter(selId => selId !== id)); // Quitar de seleccionados
        toast({ title: "Movimiento eliminado", status: "info" });
      }
    } catch (e) { console.error(e); }
  };

  const toggleSeleccion = (id) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(item => item !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  // --- MATEMÁTICAS BILLETERA ---
  const totalIngresos = gastos.filter(g => g.tipo === 'INGRESO').reduce((acc, g) => acc + parseFloat(g.monto), 0);
  const totalEgresos = gastos.filter(g => g.tipo === 'EGRESO').reduce((acc, g) => acc + parseFloat(g.monto), 0);
  const balance = totalIngresos - totalEgresos;

  const sumaSeleccionada = gastos
    .filter(g => seleccionados.includes(g.id))
    .reduce((acc, g) => acc + (g.tipo === 'INGRESO' ? parseFloat(g.monto) : -parseFloat(g.monto)), 0);

  // --- DATOS PARA GRÁFICOS ---
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];
  const datosTorta = gastos.filter(g => g.tipo === 'EGRESO').reduce((acc, g) => {
    const cat = acc.find(item => item.name === g.categoria);
    if (cat) cat.value += parseFloat(g.monto);
    else acc.push({ name: g.categoria, value: parseFloat(g.monto) });
    return acc;
  }, []);

  const datosEvolucion = gastos.reduce((acc, g) => {
    const fecha = new Date(g.fecha).toLocaleDateString();
    let dia = acc.find(item => item.fecha === fecha);
    if (!dia) {
      dia = { fecha: fecha, Ingresos: 0, Gastos: 0 };
      acc.push(dia);
    }
    if (g.tipo === 'INGRESO') dia.Ingresos += parseFloat(g.monto);
    if (g.tipo === 'EGRESO') dia.Gastos += parseFloat(g.monto);
    return acc;
  }, []).reverse(); // Damos vuelta para que se vea cronológicamente


  // --- 8. LÓGICA UI PEDIDOS ---
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

  // --- VISTA LOGIN ---
  if (!token) {
    return (
      <Container maxW="sm" py={20}>
        <Card p={6}>
          <Heading size="md" mb={4} textAlign="center">Pastillapp 🔐</Heading>
          <Stack spacing={4}>
            <FormControl><FormLabel>Usuario</FormLabel><Input onChange={(e) => setUsername(e.target.value)} /></FormControl>
            <FormControl><FormLabel>Contraseña</FormLabel><Input type="password" onChange={(e) => setPassword(e.target.value)} /></FormControl>
            <Button colorScheme="blue" onClick={handleLogin}>Ingresar</Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  // --- VISTA APP ---
  const pedidosPendientesEntrega = pedidos.filter(p => !p.entregado);
  const pedidosPendientesPago = pedidos.filter(p => !p.pagado);

  return (
    <Container maxW="container.xl" py={10}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading color="blue.600" textAlign="center">Pastillapp 💊</Heading>
        <Button size="sm" colorScheme="red" onClick={() => { setToken(null); localStorage.removeItem('token'); }}>Cerrar Sesión</Button>
      </Flex>

      <Tabs isFitted variant='soft-rounded' colorScheme='blue'>
        <TabList mb='1em' flexWrap="wrap">
          <Tab>📝 Pedidos</Tab>
          <Tab>📜 Historial</Tab>
          <Tab>👥 Pacientes</Tab>
          <Tab>💊 Inventario</Tab>
          <Tab>👛 Mi Billetera</Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: PEDIDOS */}
          <TabPanel>
            <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Tareas Pendientes</Text>
              <Button colorScheme="blue" onClick={modalPedido.onOpen}>+ Nueva Venta</Button>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              <Box>
                <Card bg="blue.50" borderTop="4px solid" borderColor="blue.400" shadow="md">
                  <CardHeader pb={2}><Heading size="md" color="blue.600">📦 Por Repartir</Heading></CardHeader>
                  <CardBody>
                    {pedidosPendientesEntrega.length === 0 ? <Text italic>Todo al día ✅</Text> : (
                      <Stack spacing={4}>
                        {pedidosPendientesEntrega.map(p => (
                          <Box key={p.id} p={3} bg="white" borderRadius="md" shadow="sm">
                            <Text fontWeight="bold">{p.nombre_paciente}</Text>
                            {p.detalles.map(d => (
                              <Text key={d.id} fontSize="xs" color="gray.600">• {d.cantidad} {d.nombre_producto}</Text>
                            ))}
                            <Button size="xs" colorScheme="blue" mt={2} w="full" onClick={() => actualizarEstadoPedido(p.id, 'entregado', p.entregado)}>Marcar Entregado</Button>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardBody>
                </Card>
              </Box>
              <Box>
                <Card bg="red.50" borderTop="4px solid" borderColor="red.400" shadow="md">
                  <CardHeader pb={2}><Heading size="md" color="red.600">💰 Por Cobrar</Heading></CardHeader>
                  <CardBody>
                    {pedidosPendientesPago.length === 0 ? <Text italic>Caja al día 💵</Text> : (
                      <Stack spacing={4}>
                        {pedidosPendientesPago.map(p => (
                          <Box key={p.id} p={3} bg="white" borderRadius="md" shadow="sm">
                            <Text fontWeight="bold">{p.nombre_paciente}</Text>
                            <Box my={1}>
                              {p.detalles.map(d => (
                                <Text key={d.id} fontSize="xs" color="gray.500">{d.cantidad}x {d.nombre_producto}</Text>
                              ))}
                            </Box>
                            <Flex justify="space-between" align="center" mt={2}>
                              <Text fontWeight="bold" color="red.600">${p.total}</Text>
                              <Button size="xs" colorScheme="red" onClick={() => actualizarEstadoPedido(p.id, 'pagado', p.pagado)}>Cobrar</Button>
                            </Flex>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardBody>
                </Card>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* TAB 2: HISTORIAL */}
          <TabPanel>
            <Heading size="md" mb={4} color="gray.600">Registro General</Heading>
            <Stack spacing={3}>
              {pedidos.slice().reverse().map(p => (
                <Box key={p.id} p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                  <Flex justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">{p.nombre_paciente}</Text>
                    <Text fontSize="xs" color="gray.500">{new Date(p.fecha_venta).toLocaleString()}</Text>
                  </Flex>
                  <Text fontSize="sm" my={1}>Total: <b>${p.total}</b></Text>
                  <Flex gap={2} mt={2}>
                    <Badge colorScheme={p.pagado ? "green" : "red"}>{p.pagado ? "PAGO" : "DEBE"}</Badge>
                    <Badge colorScheme={p.entregado ? "blue" : "gray"}>{p.entregado ? "ENTREGADO" : "PENDIENTE"}</Badge>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </TabPanel>

          {/* TAB 3: PACIENTES */}
          <TabPanel>
             <Flex justify="space-between" mb={6}>
              <Text fontSize="xl" fontWeight="bold">Agenda de Clientes</Text>
              <Button colorScheme="green" onClick={modalPaciente.onOpen}>+ Nuevo Paciente</Button>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {pacientes.map(p => (
                <Box key={p.id} p={4} borderWidth="1px" borderRadius="xl" shadow="sm">
                  <Text fontWeight="bold" fontSize="md">{p.apellido}, {p.nombre}</Text>
                  <Text fontSize="sm" color="gray.600">📞 {p.telefono || "Sin teléfono"}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* TAB 4: INVENTARIO */}
          <TabPanel>
            <Heading fontSize="xl" mb={6}>Stock y Precios</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {productos.map(p => (
                <Box key={p.id} p={4} shadow="md" borderWidth="1px" borderRadius="xl" bg="white">
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="bold" fontSize="lg" color="purple.700">{p.get_color_display}</Text>
                    <Badge colorScheme={p.stock > 10 ? "green" : "red"}>{p.stock} u.</Badge>
                  </Flex>
                  <Stack spacing={3}>
                    <Flex align="center" justify="space-between">
                      <Text fontSize="xs">Precio $</Text>
                      <Flex gap={2}>
                        <Input size="sm" w="80px" defaultValue={p.precio_actual} id={`pr-${p.id}`} />
                        <Button size="sm" onClick={() => actualizarPrecio(p.id, document.getElementById(`pr-${p.id}`).value)}>💾</Button>
                      </Flex>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text fontSize="xs">Stock</Text>
                      <Flex gap={2}>
                        <Input size="sm" w="80px" defaultValue={p.stock} id={`st-${p.id}`} />
                        <Button size="sm" colorScheme="green" onClick={() => actualizarStock(p.id, document.getElementById(`st-${p.id}`).value)}>📦</Button>
                      </Flex>
                    </Flex>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* TAB 5: MI BILLETERA */}
          <TabPanel>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Mis Finanzas 👛</Heading>
              <Button colorScheme="green" onClick={() => abrirModalGasto()}>+ Nuevo Movimiento</Button>
            </Flex>

            {/* Tarjetas de Resumen Matemático */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
              <Card bg="green.50"><CardBody><Text>Ingresos</Text><Heading size="md" color="green.600">${totalIngresos.toFixed(2)}</Heading></CardBody></Card>
              <Card bg="red.50"><CardBody><Text>Gastos</Text><Heading size="md" color="red.600">${totalEgresos.toFixed(2)}</Heading></CardBody></Card>
              <Card bg="blue.50"><CardBody><Text>Balance Total</Text><Heading size="md" color="blue.600">${balance.toFixed(2)}</Heading></CardBody></Card>
              <Card bg="purple.50" border="2px solid" borderColor="purple.300">
                <CardBody>
                  <Text fontWeight="bold">Suma Seleccionada</Text>
                  <Heading size="md" color={sumaSeleccionada >= 0 ? "green.600" : "red.600"}>
                    ${sumaSeleccionada.toFixed(2)}
                  </Heading>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Divider my={6} />

            {/* Zona de Gráficos */}
            <Box mb={8}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="bold">Análisis Visual</Text>
                <Select w="250px" bg="white" value={tipoGrafico} onChange={(e) => setTipoGrafico(e.target.value)}>
                  <option value="torta">Distribución (En qué gasto)</option>
                  <option value="barras">Comparación (Ingreso vs Gasto)</option>
                  <option value="lineas">Evolución en el Tiempo</option>
                </Select>
              </Flex>
              <Box h="300px" w="100%" bg="white" p={4} borderRadius="md" shadow="sm">
                <ResponsiveContainer width="100%" height="100%">
                  {tipoGrafico === 'torta' ? (
                    <PieChart>
                      <Pie data={datosTorta} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                        {datosTorta.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                  ) : tipoGrafico === 'barras' ? (
                    <BarChart data={datosEvolucion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="Ingresos" fill="#38A169" />
                      <Bar dataKey="Gastos" fill="#E53E3E" />
                    </BarChart>
                  ) : (
                    <LineChart data={datosEvolucion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Line type="monotone" dataKey="Ingresos" stroke="#38A169" strokeWidth={2}/>
                      <Line type="monotone" dataKey="Gastos" stroke="#E53E3E" strokeWidth={2}/>
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Lista Interactiva de Historial */}
            <Text fontWeight="bold" mb={4}>Historial de Movimientos (Selecciona para sumar)</Text>
            <Stack spacing={3}>
              {gastos.map(g => (
                <Flex key={g.id} p={3} bg="white" shadow="sm" borderRadius="md" align="center" justify="space-between" borderLeft="4px solid" borderColor={g.tipo === 'INGRESO' ? 'green.400' : 'red.400'}>
                  <Flex align="center" gap={4}>
                    <Checkbox size="lg" colorScheme={g.tipo === 'INGRESO' ? 'green' : 'red'} isChecked={seleccionados.includes(g.id)} onChange={() => toggleSeleccion(g.id)} />
                    <Box>
                      <Text fontWeight="bold">{g.nombre} <Badge ml={2}>{g.categoria}</Badge></Text>
                      <Text fontSize="xs" color="gray.500">{new Date(g.fecha).toLocaleString()} {g.descripcion ? `- ${g.descripcion}` : ''}</Text>
                    </Box>
                  </Flex>
                  <Flex align="center" gap={2}>
                    <Text fontWeight="bold" mr={4} color={g.tipo === 'INGRESO' ? 'green.600' : 'red.600'}>
                      {g.tipo === 'INGRESO' ? '+' : '-'}${g.monto}
                    </Text>
                    <Button size="xs" colorScheme="blue" variant="ghost" onClick={() => abrirModalGasto(g)}>✏️</Button>
                    <Button size="xs" colorScheme="red" variant="ghost" onClick={() => eliminarGasto(g.id)}>🗑️</Button>
                  </Flex>
                </Flex>
              ))}
              {gastos.length === 0 && <Text color="gray.500">Aún no has registrado movimientos.</Text>}
            </Stack>
          </TabPanel>

        </TabPanels>
      </Tabs>

      {/* --- MODALES --- */}
      <Modal isOpen={modalPedido.isOpen} onClose={cerrarLimpiarPedido}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cargar Nueva Venta</ModalHeader>
          <ModalBody>
             <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Paciente</FormLabel>
                <Input placeholder="Buscar..." value={busqueda} onChange={(e) => {
                  setBusqueda(e.target.value);
                  setSugerencias(pacientes.filter(p => p.nombre.toLowerCase().includes(e.target.value.toLowerCase()) || p.apellido.toLowerCase().includes(e.target.value.toLowerCase())));
                }} />
                {sugerencias.length > 0 && (
                  <List bg="white" zIndex={10} border="1px solid #ccc">
                    {sugerencias.map(p => (
                      <ListItem key={p.id} p={2} onClick={() => { setBusqueda(`${p.apellido}, ${p.nombre}`); setPacienteSeleccionado(p); setSugerencias([]); }}>{p.apellido}, {p.nombre}</ListItem>
                    ))}
                  </List>
                )}
              </FormControl>
              {lineasPedido.map((linea, index) => (
                <Flex key={index} gap={2}>
                   <Select placeholder="Prod." value={linea.productoId} onChange={(e) => actualizarFila(index, 'productoId', e.target.value)}>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.get_color_display} (${p.precio_actual})</option>)}
                   </Select>
                   <Input type="number" w="80px" value={linea.cantidad} onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)} />
                </Flex>
              ))}
              <Button size="xs" onClick={agregarFila}>+ Agregar</Button>
            </Stack>
          </ModalBody>
          <ModalFooter>
             <Button colorScheme="purple" onClick={guardarPedido}>Confirmar</Button>
             <Button variant="ghost" onClick={cerrarLimpiarPedido}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={modalPaciente.isOpen} onClose={modalPaciente.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Paciente</ModalHeader>
          <ModalBody>
             <Stack spacing={3}>
               <Input placeholder="Nombre" onChange={(e) => setNuevoNombre(e.target.value)} />
               <Input placeholder="Apellido" onChange={(e) => setNuevoApellido(e.target.value)} />
               <Input placeholder="Teléfono" onChange={(e) => setNuevoTelefono(e.target.value)} />
             </Stack>
          </ModalBody>
          <ModalFooter>
             <Button colorScheme="green" onClick={guardarPaciente}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL MI BILLETERA */}
      <Modal isOpen={modalGasto.isOpen} onClose={modalGasto.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gastoEditando ? "Editar Movimiento" : "Nuevo Movimiento"}</ModalHeader>
          <ModalBody>
            <Stack spacing={3}>
              <Input placeholder="Título (ej: Sueldo, Supermercado)" value={nuevoGasto.nombre} onChange={(e) => setNuevoGasto({...nuevoGasto, nombre: e.target.value})}/>
              <Input placeholder="Descripción opcional" value={nuevoGasto.descripcion} onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}/>
              <Input type="number" placeholder="Monto ($)" value={nuevoGasto.monto} onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}/>
              <Select value={nuevoGasto.categoria} onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}>
                <option value="SUELDO">Sueldo / Honorarios</option>
                <option value="COMIDA">Comida / Supermercado</option>
                <option value="TRANSPORTE">Transporte / Combustible</option>
                <option value="SERVICIOS">Servicios / Impuestos</option>
                <option value="OCIO">Ocio / Salidas</option>
                <option value="OTROS">Otros</option>
              </Select>
              <RadioGroup onChange={(val) => setNuevoGasto({...nuevoGasto, tipo: val})} value={nuevoGasto.tipo}>
                <Stack direction='row'>
                  <Radio value='INGRESO' colorScheme="green">Ingreso</Radio>
                  <Radio value='EGRESO' colorScheme="red">Egreso</Radio>
                </Stack>
              </RadioGroup>
            </Stack>
          </ModalBody>
          <ModalFooter>
             <Button colorScheme="green" onClick={guardarGasto}>{gastoEditando ? "Actualizar" : "Guardar"}</Button>
             <Button variant="ghost" onClick={modalGasto.onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
  )
}
export default App