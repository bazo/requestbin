package storage

import (
	"fmt"
	"log"
	"requestbin/hasher"
	"time"

	"github.com/asdine/storm"
	bolt "go.etcd.io/bbolt"
)

type Storage struct {
	hasher  *hasher.Hasher
	db      *bolt.DB
	stormDb *storm.DB
}

func NewStorage(hasher *hasher.Hasher) *Storage {
	return &Storage{
		hasher: hasher,
	}
}

func (s *Storage) Init(dbName string) error {
	stormDb, err := storm.Open(dbName, storm.BoltOptions(0600, &bolt.Options{Timeout: 1 * time.Second}))
	if err != nil {
		return err
	}

	db := stormDb.Bolt

	s.db = db
	s.stormDb = stormDb
	err = db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("bins"))
		if err != nil {
			return fmt.Errorf("create bucket: %s", err)
		}
		return nil
	})

	if err != nil {
		return err
	}

	_, err = s.FindBin("default")

	if err != nil {
		log.Println("creating default bin")
		_, err = s.CreateBinWithName("default")
	}

	return err
}

func (s *Storage) Close() {
	s.stormDb.Close()
}
