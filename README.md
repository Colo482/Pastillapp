# 1. Bajar el código desde la nube a tu compu nueva
git clone [TU_LINK_DE_GITHUB]

# --- PREPARAR EL CEREBRO (BACKEND / DJANGO) ---

# 2. Crear la "burbuja" o entorno virtual para que no se mezcle con otras cosas de la PC
python -m venv venv

# 3. Entrar a esa burbuja (en Windows)
venv\Scripts\activate

# 4. Instalar SimpleUI, Django y todo lo que pusimos en requirements.txt
pip install -r requirements.txt

# 5. Crear las tablas en la base de datos vacía de tu nueva PC
python backend/manage.py migrate

# --- PREPARAR LA CARA (FRONTEND / REACT) ---

# 6. Moverte a la carpeta donde vive tu página web
cd backend/frontend

# 7. Descargar todas las librerías de React (crea la carpeta node_modules)
npm install