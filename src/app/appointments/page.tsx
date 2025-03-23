                    <TableRow>
                      <TableCell className="font-medium">Time</TableCell>
                      <TableCell className="font-medium">Type</TableCell>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell className="font-medium">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {Array.isArray(appointment.appointmentTimeFrom) 
                            ? appointment.appointmentTimeFrom.map((time, index) => (
                                <div key={index}>{time}</div>
                              ))
                            : appointment.appointmentTimeFrom}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(appointment.appointmentType)
                            ? appointment.appointmentType.map((type, index) => (
                                <div key={index}>{type}</div>
                              ))
                            : appointment.appointmentType}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell> 