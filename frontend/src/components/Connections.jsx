import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

const Connections = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => api.get('/user/connections'),
  });

  if (error)
    return <div className='text-center mt-10'>Failed to load connections</div>;
  if (isLoading) return <div className='text-center mt-10'>Loading...</div>;

  if (!Array.isArray(data) || data.length === 0)
    return <div className='text-center mt-10'>No connections found</div>;

  return (
    <div className='flex flex-col items-center my-10'>
      <h1 className='text-3xl font-bold mb-5'>Connections</h1>
      {data.map((user) => (
        <div
          key={user._id}
          className='card card-side bg-base-200 shadow-xl w-1/2 mb-4'
        >
          <figure>
            <img
              src={user.photoUrl}
              alt='User'
              className='w-24 h-24 object-cover m-4 rounded-full'
            />
          </figure>
          <div className='card-body'>
            <h2 className='card-title'>
              {user.firstName} {user.lastName}
            </h2>
            <p>{user.about}</p>
            <div className='card-actions justify-end mt-4'>
              <Link to={`/chat/${user._id}`} className='btn btn-ghost text-xl'>
                Chat 👩
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Connections;
