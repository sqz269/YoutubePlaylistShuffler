from PlaylistShuffler import app

if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run("192.168.29.197", 8080)
